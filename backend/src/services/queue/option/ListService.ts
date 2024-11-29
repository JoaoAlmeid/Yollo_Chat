import prisma from "../../../prisma/client"
import { QueueOption } from "@prisma/client"

type QueueOptionFilter = {
  queueId?: string | number
  queueOptionId?: string | number
  parentId?: string | number | boolean
}

const ListQOptionService = async ({ queueId, queueOptionId, parentId }: QueueOptionFilter): Promise<QueueOption[]> => {
  // Define o objeto de condições para o filtro de busca
  const whereOptions: {
    queueId?: number
    id?: number
    parentId?: number | null
  } = {}

  // Adiciona a condição para o Id da fila
  if (queueId) {
    whereOptions.queueId = Number(queueId)
  }

  // Adicionar a condição para o Id da opção
  if (queueOptionId) {
    whereOptions.id = Number(queueOptionId)
  }

  // Adiciona a condição para o Id do pai
  if (parentId === -1) {
    whereOptions.parentId = null
  } else if (parentId && typeof parentId === 'number'){
    whereOptions.parentId = Number(parentId)
  }

  // Busca opções de fila no banco de dados
  const queueOptions = await prisma.queueOption.findMany({
    where: whereOptions,
    orderBy: {
      id: 'asc'
    }
  })

  return queueOptions
}

export default ListQOptionService
