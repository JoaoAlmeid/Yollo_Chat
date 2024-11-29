import prisma from '../../prisma/client'
import { CronJob } from 'cron'
import moment from 'moment'
import nodemailer from 'nodemailer'
import { logger } from '../../utils/Logger'

async function handleInvoiceCreate() {
  logger.info('Iniciando geração de boletos')

  const job = new CronJob('*/5 * * * * *', async () => {
    try {
      const companies = await prisma.company.findMany()

      for (const c of companies) {
        const dueDate = moment(c.dueDate)
        const hoje = moment()
        const vencimento = moment(dueDate)

        const diff = vencimento.diff(hoje, 'days')

        if (diff < 20) {
          const plan = await prisma.plan.findUnique({
            where: { id: c.planId },
          })

          // Verifica se já existe uma fatura com a mesma data de vencimento
          const existingInvoiceCount = await prisma.invoice.count({
            where: {
              companyId: c.id,
              dueDate: {
                startsWith: dueDate.format('YYYY-MM-DD'),
              },
            },
          })

          if (existingInvoiceCount === 0) {
            // Gera um número de fatura único
            const invoiceNumber = `INV-${moment().format('YYYYMMDDHHmmss')}-${c.id}`

            // Cria uma nova fatura
            await prisma.invoice.create({
              data: {
                id: Number(invoiceNumber),
                detail: plan?.name || '',
                status: 'open',
                value: plan?.value || 0,
                updatedAt: new Date(),
                createdAt: new Date(),
                dueDate: dueDate.format('YYYY-MM-DD'),
                companyId: c.id,
              },
            })

            // Configuração do transportador de e-mail
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            })

            // Verifica se o e-mail da empresa é válido
            const email = c.email?.trim()

            if (email) {
              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Fatura gerada - Sistema',
                html: `Olá ${c.name}, este é um e-mail sobre sua fatura!<br>
                  <br>
                  Vencimento: ${vencimento.format('DD/MM/YYYY')}<br>
                  Valor: ${plan?.value}<br>
                  Link: ${process.env.FRONTEND_URL}/financeiro<br>
                  <br>
                  Qualquer dúvida estamos à disposição!`,
              }

              // Envia o e-mail
              await transporter.sendMail(mailOptions)
              logger.info(`Email de fatura enviado para: ${c.email}`)
            } else {
              logger.warn(
                `E-mail inválido ou não encontrado para a empresa: ${c.id}`
              )
            }
          }
        }
      }
    } catch (e: any) {
      logger.error(`Erro ao gerar faturas: ${e.message}`)
    }
  })

  job.start()
}

export default handleInvoiceCreate