import { QueueOption } from "@prisma/client"
import prisma from "../../../prisma/client";

interface QueueOptionData {
  queueId: number;
  title: string;
  option: string;
  message?: string;
  parentId?: number;
}

const CreateQOptionService = async (queueOptionData: QueueOptionData): Promise<QueueOption> => {
  // Cria uma nova opção de fila no banco de dados
  const queueOption = await prisma.queueOption.create({
    data: {
      queueId: queueOptionData.queueId,
      title: queueOptionData.title,
      option: queueOptionData.option,
      message: queueOptionData.message,
      parentId: queueOptionData.parentId
    }
  });
  return queueOption;
};

export default CreateQOptionService;
