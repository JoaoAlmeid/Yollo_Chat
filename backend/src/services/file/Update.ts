import * as Yup from "yup";
import AppError from "../../errors/AppError";
import { Files } from "@prisma/client";
import ShowService from "./Show";
import prisma from "../../prisma/client";
import { FilesWithOptions, UpdateRequest } from "./types";

const UpdateService = async ({ fileData, id, companyId }: UpdateRequest): Promise<Files | undefined> => {
  try {
    const file = await ShowService(id, companyId);
  
    const schema = Yup.object().shape({
      name: Yup.string().min(3).required("ERR_FILE_NAME_REQUIRED"),
      message: Yup.string().optional(),
      options: Yup.array().of(
        Yup.object().shape({
          id: Yup.number().optional(),
        })
      ).optional()
    });
  
    try {
      await schema.validate(fileData, { abortEarly: false });
    } catch (err: any) {
      throw new AppError(`Erro de validação: ${err.errors.join(", ")}`, 400);
    }
  
    const { name, message, options } = fileData;
  
    if (options) {
      await Promise.all(
        options.map(async (info) => {
          await prisma.filesOptions.upsert({
            where: { id: info.id ?? -1 },
            update: { ...info },
            create: { ...info, fileId: file.id }
          });
        })
      );
  
      await Promise.all(
        (file as FilesWithOptions).options.map(async (oldInfo) => {
          const stillExists = options.some((info) => info.id === oldInfo.id);
  
          if (!stillExists) {
            await prisma.filesOptions.delete({ where: { id: oldInfo.id } });
          }
        })
      );
    }
  
    const updatedFile = await prisma.files.update({
      where: { id: file.id },
      data: { name, message },
      include: { options: true }
    });
  
    return updatedFile;
  } catch (error: any) {
    console.error(`Erro ao atualizar arquivo: ${error.message}`)
    throw new AppError(`Erro interno ao atualizar arquivo: ${error.message}`, 500)
  }
}

export default UpdateService