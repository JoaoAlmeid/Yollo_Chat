import { getIO } from "../../libs/socket"
import prisma from "../../prisma/client"
import { Contact } from "@prisma/client"
import { isNil } from "lodash"
import { Data } from "./types"
import AppError from "../../errors/AppError"

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  companyId,
  extraInfo = [],
  whatsappId
}: Data): Promise<Contact> => {
  try {
    const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "")
  
    const io = getIO()
    let contact: Contact | null
  
    contact = await prisma.contact.findUnique({
      where: { number, companyId }
    })
  
    if (contact) {
      contact = await prisma.contact.update({
          where: { id: contact.id },
          data: {
              profilePicUrl,
              whatsappId: isNil(contact.whatsappId) ? whatsappId : contact.whatsappId
          }
      })
  
      io.emit(`company-${companyId}-contact`, {
        action: "update",
        contact
      })
    } else {
      contact = await prisma.contact.create({
          data: {
              name,
              number,
              profilePicUrl,
              email,
              isGroup,
              extraInfo: { create: extraInfo.map(info => ({ name: info.name, value: info.value })) },
              companyId,
              whatsappId
          }
      })
  
      io.emit(`company-${companyId}-contact`, {
        action: "create",
        contact
      })
    }
  
    return contact
  } catch (error: any) {
    console.error(`Erro ao criar ou atualizar contato: ${error.message}`)
    throw new AppError(`Erro interno ao criar ou atualizar contato: ${error.message}`, 500)
  }
}

export default CreateOrUpdateContactService