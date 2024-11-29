import prisma from "../../../prisma/client";
import { QueueOption } from "@prisma/client";
import ShowService from "./ShowService";
import AppError from "src/errors/AppError";

interface QueueData {
  queueId?: string;
  title?: string;
  option?: string;
  message?: string;
  parentId?: string | null;
}

const UpdateQOptionService = async (
  queueOptionId: number | string,
  queueOptionData: QueueData
): Promise<QueueOption> => {
  // Obtém a opção de fila existente
  const queueOption = await ShowService(queueOptionId);

  // Verifica se a opção de fila foi encontrada
  if (!queueOption) {
    throw new AppError("ERR_QUEUE_OPTION_NOT_FOUND", 404)
  }

  // Atualiza a opção de fila no banco de dados
  const updatedQueueOption = await prisma.queueOption.update({
    where: { id: queueOption.id },
    data: {
      title: queueOptionData.title,
      option: queueOptionData.option,
      message: queueOptionData.message,
      parentId: queueOptionData.parentId ?? null,
    } as any
  })

  // Retorna a opção de fila atualizada
  return updatedQueueOption;
};

export default UpdateQOptionService;
