import { Contact, Message, Ticket } from "@prisma/client";
import { proto } from "@whiskeysockets/baileys";
import { Session } from "../../../@types/Session";
import getBodyMessage from "./get/getBodyMessage";
import ShowWhatsApp from "../../whatsapp/ShowWhatsApp";
import { isNil } from "lodash";
import path from "path";
import prisma from "../../../prisma/client";
import { deleteFileSync, keepOnlySpecifiedChars, sanitizeName, transferQueue } from "./Utils";
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from "openai";
import convertTextToSpeechAndSaveToFile from "./convert/convertTextToSpeecAndSaveToFile";
import verifyMediaMessage from "./verify/verifyMediaMessage";
import verifyMessage from "./verify/verifyMessage";
import fs from 'fs'

interface SessionOpenAi extends OpenAIApi { id?: number }
const sessionsOpenAi: SessionOpenAi[] = []

const handleOpenAi = async (msg: proto.IWebMessageInfo, wbot: Session, ticket: Ticket, contact: Contact, mediaSent: Message | undefined): Promise<void> => {
    const bodyMessage = getBodyMessage(msg);
    if (!bodyMessage || msg.messageStubType) return;

    const ticketWithQueue = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: {
            queue: {
                include: {
                    prompt: true
                }
            }
        }
    });
  
    // Obtém o prompt associado ao ticket
    const result = await ShowWhatsApp(wbot.id, ticket.companyId);
    let promptId = result?.promptId

    if (!promptId && !isNil(ticketWithQueue?.queue?.prompt)) {
        ticketWithQueue.queue.prompt;
    }
    if (!promptId) return;

    const prompt = await prisma.prompt.findUnique({
        where: { id: promptId }
    })
  
    const publicFolder: string = path.resolve(__dirname, "..", "..", "..", "public");
  
    let openai: SessionOpenAi
    const openAiIndex = sessionsOpenAi.findIndex(s => s.id === wbot.id);
  
    if (openAiIndex === -1) {
        const configuration = new Configuration({ apiKey: prompt.apiKey })
        openai = new OpenAIApi(configuration)
        openai.id = wbot.id
        sessionsOpenAi.push(openai);
    } else {
        openai = sessionsOpenAi[openAiIndex]
    }
  
    const messages = await prisma.message.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: "asc" },
      take: 10
    });
  
    const promptSystem = `Nas respostas utilize o nome ${sanitizeName(
      contact.name || "Amigo(a)"
    )} para identificar o cliente... \n ${prompt.prompt}\n`;
  
    let messagesOpenAi: ChatCompletionRequestMessage[] = []
    
    if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
        messagesOpenAi = [];
        messagesOpenAi.push({ role: "system", content: promptSystem });

        for (let i = 0; i < Math.min(prompt.maxMessages, messages.length); i++) {
          const message = messages[i];
          if (message.mediaType === "chat") {
            messagesOpenAi.push({
                role: message.fromMe ? "assistant" : "user",
                content: message.body
            })
          }
        }
        messagesOpenAi.push({ role: "user", content: bodyMessage! });
    
        const chat = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-1106",
          messages: messagesOpenAi,
          max_tokens: prompt.maxTokens,
          temperature: prompt.temperature
        });
    
        let response = chat.data.choices[0].message?.content;
    
        if (response?.includes("Ação: Transferir para o setor de atendimento")) {
          await transferQueue(prompt.queueId, ticket, contact);
          response = response
            .replace("Ação: Transferir para o setor de atendimento", "")
            .trim();
        }
    
        if (prompt.voice === "texto") {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: response!
          });
          await verifyMessage(sentMessage!, ticket, contact);
        } else {
          const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
          convertTextToSpeechAndSaveToFile(
            keepOnlySpecifiedChars(response!),
            `${publicFolder}/${fileNameWithOutExtension}`,
            prompt.voiceKey,
            prompt.voiceRegion,
            prompt.voice,
            "mp3"
          ).then(async () => {
            try {
              const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
                audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
                mimetype: "audio/mpeg",
                ptt: true
              });
              await verifyMediaMessage(sendMessage!, ticket, contact);
              deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
              deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
            } catch (error: any) {
              console.log(`Erro para responder com audio: ${error}`);
            }
          });
        }
      } else if (msg.message?.audioMessage) {
        const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
        const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;
        const transcription = await openai.createTranscription(file, "whisper-1");
    
        messagesOpenAi = [];
        messagesOpenAi.push({ role: "system", content: promptSystem });
        for (
          let i = 0;
          i < Math.min(prompt.maxMessages, messages.length);
          i++
        ) {
          const message = messages[i];
          if (message.mediaType === "chat") {
            if (message.fromMe) {
              messagesOpenAi.push({ role: "assistant", content: message.body });
            } else {
              messagesOpenAi.push({ role: "user", content: message.body });
            }
          }
        }
        messagesOpenAi.push({ role: "user", content: transcription.data.text });
        const chat = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-1106",
          messages: messagesOpenAi,
          max_tokens: prompt.maxTokens,
          temperature: prompt.temperature
        });
        let response = chat.data.choices[0].message?.content;
    
        if (response?.includes("Ação: Transferir para o setor de atendimento")) {
          await transferQueue(prompt.queueId, ticket, contact);
          response = response
            .replace("Ação: Transferir para o setor de atendimento", "")
            .trim();
        }
        if (prompt.voice === "texto") {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: response!
          });
          await verifyMessage(sentMessage!, ticket, contact);
        } else {
          const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
          convertTextToSpeechAndSaveToFile(
            keepOnlySpecifiedChars(response!),
            `${publicFolder}/${fileNameWithOutExtension}`,
            prompt.voiceKey,
            prompt.voiceRegion,
            prompt.voice,
            "mp3"
          ).then(async () => {
            try {
              const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
                audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
                mimetype: "audio/mpeg",
                ptt: true
              });
              await verifyMediaMessage(sendMessage!, ticket, contact);
              deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
              deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
            } catch (error: any) {
              console.log(`Erro para responder com audio: ${error}`);
            }
          });
        }
      }
}

export default handleOpenAi;
