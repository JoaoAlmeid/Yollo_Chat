import { WASocket, proto } from "@whiskeysockets/baileys";
import { Ticket, QueueIntegrations } from "@prisma/client";

type Session = WASocket & { id?: number }

export interface RequestTBot {
    wbot: Session;
    msg: proto.IWebMessageInfo;
    ticket: Ticket;
    typebot: QueueIntegrations;
}