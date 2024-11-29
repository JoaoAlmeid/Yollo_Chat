import axios from "axios";
import { QueueIntegrations, Ticket } from "@prisma/client";
import { WASocket, delay, proto } from "@whiskeysockets/baileys";
import getBodyMessage from "../wbot/messageListener/get/getBodyMessage";
import { logger } from "../../utils/Logger";
import { isNil } from "lodash";
import UpdateTicket from "../tickets/UpdateTicket";
import prisma from "../../prisma/client";

type Session = WASocket & {
    id?: number;
};

interface Request {
    wbot: Session;
    msg: proto.IWebMessageInfo;
    ticket: Ticket;
    typebot: QueueIntegrations;
}

// Cria uma nova sessão com o tipo do bot
const createSession = async (msg, typebot, number) => {
    try {
        const id = Math.floor(Math.random() * 10000000000).toString()
        const reqData = JSON.stringify({
            "isStreamEnabled": true,
            "message": "string",
            "resultId": "string",
            "isOnlyRegistering": false,
            "prefilledVariables": {
                "number": number,
                "pushName": msg.pushName || ""
            },
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${typebot.urlN8N}/api/v1/typebots/${typebot.typebotSlug}/startChat`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: reqData
        };

        const request = await axios.request(config);
        return request.data;
    } catch (error: any) {
        logger.error(`Erro ao criar sessão do typebot: ${error}`)
        throw error
    }
}

// Formata e envia mensagens
const sendFormattedMessages = async (wbot, msg, messages, input, typebotDelayMessage) => {
    for (const message of messages) {
        if (message.type === 'text') {
            const formattedText = formatTextMessage(message.content)
            await sendMessageWithPresence(wbot, msg.key.remoteJid, formattedText, typebotDelayMessage)
        }
        if (message.type === 'audio') {
            const media = { audio: { url: message.content.url, mimetype: 'audio/mp4', ptt: true } };
            await sendMessageWithPresence(wbot, msg.key.remoteJid, media, typebotDelayMessage);
        }

        if (message.type === 'image') {
            const media = { image: { url: message.content.url } };
            await sendMessageWithPresence(wbot, msg.key.remoteJid, media, typebotDelayMessage);
        }
    }
    if (input?.type === 'choice input') {
        const formattedText = input.items.map(item => `▶️ ${item.content}`).join('\n');
        await sendMessageWithPresence(wbot, msg.key.remoteJid, { text: formattedText }, typebotDelayMessage);
    }
}

// Envia mensagem com atualização de presença
const sendMessageWithPresence = async (wbot, remoteJid, message, delayTime) => {
    await wbot.presenceSubscribe(remoteJid)
    await wbot.sendPresenceUpdate('composing', remoteJid)
    await delay(delayTime)
    await wbot.sendPresenceUpdate('paused', remoteJid)
    await wbot.sendMessage(remoteJid, message)
}

// Formatar mensagens de texto com base no conteúdo
const formatTextMessage = (content) => {
    let formattedText = ''
    let linkPreview = false

    for (const richText of content.richText) {
        for (const element of richText.children) {
            let text = element.text || ''
            if (element.bold) text = `*${text}*`
            if (element.italic) text = `_${text}_`
            if (element.underline) text = `~${text}~`
            if (element.url) {
                const linkText = element.children[0].text
                text = `[${linkText}](${element.url})`
                linkPreview = true
            }
            formattedText += text
        }
        formattedText += '\n'
    }
    return formattedText.replace('**', '').trim()
}

const typebotListener = async ({ wbot, msg, ticket, typebot }: Request): Promise<void> => {
    if (msg.key.remoteJid === 'status@broadcast') return

    const number = msg.key.remoteJid.replace(/\D/g, '')
    const body = getBodyMessage(msg)

    try {
        const dataLimite = new Date()
        dataLimite.setMinutes(dataLimite.getMinutes() - Number(typebot.typebotExpires))

        if (Number(typebot.typebotExpires) > 0 && ticket.updatedAt < dataLimite) {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    typebotSessionId: null,
                    isBot: true
                }
            })
        }

        let sessionId: string | undefined
        let status = false

        if (isNil(ticket.typebotSessionId)) {
            const dataStart = await createSession(msg, typebot, number)
            sessionId = dataStart.sessionId
            status = true
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    typebotSessionId: sessionId,
                    typebotStatus: true,
                    useIntegration: true,
                    integrationId: typebot.id
                }
            })
        } else {
            sessionId = ticket.typebotSessionId
            status = ticket.typebotStatus
        }

        if (!status) return

        let messages = []
        let input

        if (body !== typebot.typebotKeywordFinish && body !== typebot.typebotKeywordRestart) {
            if (!isNil(ticket.typebotSessionId)) {
                const dataStart = await axios.request({
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${typebot.urlN8N}/api/v1/sessions/${sessionId}/continueChat`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    data: JSON.stringify({ message: body })
                })
                messages = dataStart.data?.messages || [],
                input = dataStart.data?.input
            }

            if (messages.length === 0) {
                await sendMessageWithPresence(wbot, msg.key.remoteJid, { text: typebot.typebotUnknownMessage }, typebot.typebotDelayMessage)
            } else {
                await sendFormattedMessages(wbot, msg, messages, input, typebot.typebotDelayMessage)
            }
        }

        if (body === typebot.typebotKeywordRestart) {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    isBot: true,
                    typebotSessionId: null
                }
            })
            await wbot.sendMessage(`${number}@c.us`, { text: typebot.typebotRestartMessage })
        }

        if (body === typebot.typebotKeywordFinish) {
            await UpdateTicket({
                ticketData: {
                    status: "closed",
                    useIntegration: false,
                    integrationId: null
                },
                ticketId: ticket.id,
                companyId: ticket.companyId
            })
        }
    } catch (error: any) {
        logger.error(`Erro no ouvinte do typebot: ${error}`)
        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { typebotSessionId: null }
        })
        throw error
    }
}

export default typebotListener;