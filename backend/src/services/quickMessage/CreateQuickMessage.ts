import * as Yup from "yup"
import AppError from "../../errors/AppError"
import { QuickMessage } from "@prisma/client"
import prisma from "../../prisma/client"

interface Data {
  shortcode: string
  message: string
  mediaName?: string
  companyId: number | string
  userId: number | string
}

const CreateQMessage = async (data: Data): Promise<QuickMessage> => {
  const { shortcode, message, companyId, userId } = data

  const quickMessageSchema = Yup.object().shape({
    shortcode: Yup.string()
      .min(3, "ERR_QUICKMESSAGE_INVALID_NAME")
      .required("ERR_QUICKMESSAGE_REQUIRED"),
    message: Yup.string()
      .min(3, "ERR_QUICKMESSAGE_INVALID_NAME")
      .required("ERR_QUICKMESSAGE_REQUIRED"),
  })

  try {
    await quickMessageSchema.validate({ shortcode, message })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  // Usando `connect` para associar `companyId` e `userId`
  const record = await prisma.quickMessage.create({
    data: {
      shortcode,
      message,
      mediaName: null,
      company: {
        connect: {
          id: Number(companyId),
        },
      },
      user: {
        connect: {
          id: Number(userId),
        },
      },
      updatedAt: new Date(),
    },
  })

  return record
}

export default CreateQMessage
