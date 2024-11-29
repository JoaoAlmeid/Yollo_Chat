import * as Yup from "yup"
import AppError from "../../errors/AppError"
import { Files } from "@prisma/client"
import prisma from "../../prisma/client"
import ShowService from "./Show"
import { Data } from "./types"

const CreateService = async ({
  name,
  message,
  companyId,
  options
}: Data): Promise<Files> => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(3)
        .test(
          "Check-unique-name",
          "ERR_RATING_NAME_ALREADY_EXISTS",
          async value => {
            if (value) {
              const tagWithSameName = await prisma.files.findFirst({
                where: { name: value, companyId }
              })
  
              return !tagWithSameName
            }
            return false
          }
        )
    })
  
    try {
      await schema.validate({ name })
    } catch (err: any) {
      throw new AppError(err.message)
    }
  
    // Cria o registro em "Files"
    let fileList = await prisma.files.create({
      data: {
        name, 
        message, 
        companyId 
      }
    })
  
    // Cria ou atualiza as opções associadas
    if(options && options.length > 0) {
      await Promise.all(
        options.map(async info => {
          await prisma.filesOptions.upsert({
            where: {
              fileId: fileList.id,
              id: info.id,
            },
            update: { ...info },
            create: {
              ...info,
              fileId: fileList.id
            }
          })
        })
      )
    }
  
    // Obtenha os detalhes completos
    fileList = await ShowService(fileList.id, companyId)
  
    return fileList
  } catch (error) {
    console.error(`Erro ao criar arquivo: ${error.message}`)
    throw new AppError(`Erro interno ao criar arquivo: ${error.message}`, 500)
  }
}

export default CreateService