import { Chat, Contact } from "@whiskeysockets/baileys"
import { Baileys } from "@prisma/client"
import { isArray, uniqBy } from "lodash"
import prisma from "../../prisma/client"

interface Request {
  whatsappId: number
  contacts?: Contact[]
  chats?: Chat[]
}

const createOrUpdateBaileysService = async ({ whatsappId, contacts, chats}: Request): Promise<Baileys> => {
    try {
        const baileysExists = await prisma.baileys.findUnique({
          where: { id: whatsappId }
        })

        let getChats: Chat[] = []
        let getContacts: Contact[] = []

        if (baileysExists) {
          getChats = baileysExists.chats ? JSON.parse(baileysExists.chats) : []
          getContacts = baileysExists.contacts ? JSON.parse(baileysExists.contacts) : []
      
          if (chats && isArray(getChats)) {
            getChats.push(...chats)
            getChats = uniqBy(getChats, 'id')
          }
      
          if (contacts && isArray(contacts)) {
            getContacts.push(...contacts)
            getContacts = uniqBy(getContacts, 'id')
          }
      
          const newBaileys = await prisma.baileys.update({
              where: { id: whatsappId },
              data: {
                  chats: JSON.stringify(getChats),
                  contacts: JSON.stringify(getContacts)
              }
          })
      
          return newBaileys
        }
      
        const baileys = await prisma.baileys.create({
          data: {
              whatsappId,
              contacts: JSON.stringify(contacts || []),
              chats: JSON.stringify(chats || [])
          }
        })
      
        return baileys
    } catch (err) {
        console.error(`Erro ao criar ou atualizar Baileys: ${err.message}`)
        throw err
    }
}

export default createOrUpdateBaileysService