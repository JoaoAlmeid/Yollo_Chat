import { QueueIntegrations, Ticket } from "@prisma/client";
import { proto } from "@whiskeysockets/baileys";
import { Session } from "../../../@types/Session";
import getTypeMessage from "./get/getTypeMessage";
import typebotListener from "../../typebot/typebotListener";
import axios from 'axios'

const handleMessageIntegration = async (msg: proto.IWebMessageInfo, wbot: Session, queueIntegration: QueueIntegrations, ticket: Ticket): Promise<void> => {
    const msgType = getTypeMessage(msg);
  
    try {
      if (queueIntegration.type === "n8n" || queueIntegration.type === "webhook") {
        if (queueIntegration?.urlN8N) {
          const options = {
            method: "POST",
            url: queueIntegration?.urlN8N,
            headers: {
              "Content-Type": "application/json"
            },
            data: msg
          }
  
          const response = await axios(options)
          console.log(response.data)
        }
    
      } else if (queueIntegration.type === "typebot") {
        console.log("Entrou no typebot")
        await typebotListener({ ticket, msg, wbot, typebot: queueIntegration });
      }
    } catch (error: any) {
      console.error(`Erro ao processar a integração: ${error.message}`)
      throw new Error(`Erro no integração com ${queueIntegration.type}: ${error.message}`)
    }
}

export default handleMessageIntegration