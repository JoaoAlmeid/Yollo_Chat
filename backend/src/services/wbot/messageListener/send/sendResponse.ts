import { Session } from "src/@types/Session"
import convertTextToSpeechAndSaveToFile from "../convert/convertTextToSpeecAndSaveToFile"
import { deleteFileSync, keepOnlySpecifiedChars } from "../Utils"
import verifyMediaMessage from "../verify/verifyMediaMessage"
import verifyMessage from "../verify/verifyMessage"
import { proto } from "@whiskeysockets/baileys"
import { Contact, Ticket } from "@prisma/client"

const sendResponse = async (
    response: string | undefined,
    wbot: Session,
    msg: proto.IWebMessageInfo,
    ticket: Ticket,
    contact: Contact,
    prompt: any,
    publicFolder: string
) => {
    if (!response) return

    if (prompt.voice === 'texto') {
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: response })
        await verifyMessage(sentMessage!, ticket, contact)
    } else {
        const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`
        await convertTextToSpeechAndSaveToFile(
            keepOnlySpecifiedChars(response),
            `${publicFolder}/${fileNameWithOutExtension}`,
            prompt.voiceKey,
            prompt.voiceRegion,
            prompt.voice,
            "mp3"
        )

        try {
            const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
                audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
                mimetype: "audio/mpeg",
                ptt: true
            })
            await verifyMediaMessage(sendMessage!, ticket, contact)
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`)
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`)
        } catch (error: any) {
            console.error(`Erro ao responder com áudio: ${error}`)
        }
    }
}

export default sendResponse