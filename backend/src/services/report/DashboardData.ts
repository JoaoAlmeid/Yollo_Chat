import prisma from '../../prisma/client'
import { Prisma } from '@prisma/client'

export interface DashboardData {
  counters: {
    avgSupportTime: number | null
    avgWaitTime: number | null
    supportHappening: number
    supportPending: number
    supportFinished: number
    leads: number
  }
  attendants: {
    id: number
    name: string
    avgSupportTime: number | null
    tickets: number
    rating: number | null
    online: boolean
  }[]
}

export interface Params {
  days?: number
  date_from?: string
  date_to?: string
}

const DashboardDataService = async (
  companyId: string | number,
  params: Params
): Promise<DashboardData> => {
  try {
    // Inicializar a consulta com CTEs
    let query = Prisma.sql`
      WITH
      traking AS (
        SELECT
          c.name AS "companyName",
          u.name AS "userName",
          u.online AS "userOnline",
          w.name AS "whatsappName",
          ct.name AS "contactName",
          ct.number AS "contactNumber",
          (tt."finishedAt" IS NOT NULL) AS "finished",
          (tt."userId" IS NULL AND tt."finishedAt" IS NULL) AS "pending",
          COALESCE((
            (DATE_PART('day', AGE(COALESCE(tt."ratingAt", tt."finishedAt"), tt."startedAt")) * 24 * 60) +
            (DATE_PART('hour', AGE(COALESCE(tt."ratingAt", tt."finishedAt"), tt."startedAt")) * 60) +
            (DATE_PART('minute', AGE(COALESCE(tt."ratingAt", tt."finishedAt"), tt."startedAt")))
          ), 0) AS "supportTime",
          COALESCE((
            (DATE_PART('day', AGE(tt."startedAt", tt."queuedAt")) * 24 * 60) +
            (DATE_PART('hour', AGE(tt."startedAt", tt."queuedAt")) * 60) +
            (DATE_PART('minute', AGE(tt."startedAt", tt."queuedAt")))
          ), 0) AS "waitTime",
          t.status,
          tt.*,
          ct."id" AS "contactId"
        FROM "TicketTraking" tt
        LEFT JOIN "Companies" c ON c.id = tt."companyId"
        LEFT JOIN "Users" u ON u.id = tt."userId"
        LEFT JOIN "Whatsapps" w ON w.id = tt."whatsappId"
        LEFT JOIN "Tickets" t ON t.id = tt."ticketId"
        LEFT JOIN "Contacts" ct ON ct.id = t."contactId"
        -- filterPeriod
      ),
      counters AS (
        SELECT
          (SELECT AVG("supportTime") FROM traking WHERE "supportTime" > 0) AS "avgSupportTime",
          (SELECT AVG("waitTime") FROM traking WHERE "waitTime" > 0) AS "avgWaitTime",
          (
            SELECT COUNT(DISTINCT "id")
            FROM "Tickets"
            WHERE status LIKE 'open' AND "companyId" = ${companyId}
          ) AS "supportHappening",
          (
            SELECT COUNT(DISTINCT "id")
            FROM "Tickets"
            WHERE status LIKE 'pending' AND "companyId" = ${companyId}
          ) AS "supportPending",
          (SELECT COUNT(id) FROM traking WHERE finished) AS "supportFinished",
          (
            SELECT COUNT(leads.id) FROM (
              SELECT
                ct1.id,
                COUNT(tt1.id) AS total
              FROM traking tt1
              LEFT JOIN "Tickets" t1 ON t1.id = tt1."ticketId"
              LEFT JOIN "Contacts" ct1 ON ct1.id = t1."contactId"
              GROUP BY 1
              HAVING COUNT(tt1.id) = 1
            ) leads
          ) AS "leads"
      ),
      attendants AS (
        SELECT
          u.id,
          u.name,
          COALESCE(att."avgSupportTime", 0) AS "avgSupportTime",
          att.tickets,
          att.rating,
          att.online
        FROM "Users" u
        LEFT JOIN (
          SELECT
            u1.id,
            u1."name",
            u1."online",
            AVG(t."supportTime") AS "avgSupportTime",
            COUNT(t."id") AS tickets,
            COALESCE(AVG(ur.rate), 0) AS rating
          FROM "Users" u1
          LEFT JOIN traking t ON t."userId" = u1.id
          LEFT JOIN "UserRatings" ur ON ur."userId" = t."userId" AND ur."createdAt"::date = t."finishedAt"::date
          GROUP BY 1, 2
        ) att ON att.id = u.id
        WHERE u."companyId" = ${companyId}
        ORDER BY att.name
      )
      SELECT
        (SELECT COALESCE(jsonb_build_object('counters', c.*)->>'counters', '{}')::jsonb FROM counters c) AS counters,
        (SELECT COALESCE(json_agg(a.*), '[]')::jsonb FROM attendants a) AS attendants
    `

    // Adicionar filtros com segurança
    if (params.days) {
      query = Prisma.sql`${query} AND tt."queuedAt" >= NOW() - INTERVAL '${params.days} days'`
    }

    if (params.date_from) {
      query = Prisma.sql`${query} AND tt."queuedAt" >= ${Prisma.raw(params.date_from + ' 00:00:00')}`
    }

    if (params.date_to) {
      query = Prisma.sql`${query} AND tt."finishedAt" <= ${Prisma.raw(params.date_to + ' 23:59:59')}`
    }

    const responseData: DashboardData = await prisma.$queryRaw(query)

    return responseData
  } catch (error: any) {
    console.error('Erro ao buscar dados do dashboard:', error)
    throw new Error('Erro ao buscar dados do dashboard.')
  }
}

export default DashboardDataService
