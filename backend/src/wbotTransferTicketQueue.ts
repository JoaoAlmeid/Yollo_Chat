import moment from "moment";
import { getIO } from "./libs/socket";
import { logger } from "./utils/Logger";
import ShowTicket from "./services/tickets/ShowTicket";
import prisma from "./prisma/client";

export const TransferTicketQueue = async (): Promise<void> => {
    const io = getIO();

    // Buscar os tickets que estão pendentes e sem fila
    const tickets = await prisma.ticket.findMany({
        where: {
            status: "pending",
            queueId: null
        }
    });

    // Varrer os tickets e verificar se algum deles está com o tempo estourado
    tickets.forEach(async (ticket) => {
        const wpp = await prisma.whatsapp.findUnique({
            where: { id: ticket.whatsappId }
        });

        if (!wpp || !wpp.timeToTransfer || !wpp.transferQueueId || wpp.timeToTransfer === 0) return;

        let dataLimite = new Date(ticket.updatedAt);
        dataLimite.setMinutes(dataLimite.getMinutes() + wpp.timeToTransfer);

        if (new Date() > dataLimite) {
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: { queueId: wpp.transferQueueId }
            });

            const ticketTraking = await prisma.ticketTracking.findFirst({
                where: { ticketId: ticket.id },
                orderBy: { createdAt: "desc" }
            });

            if (ticketTraking) {
                await prisma.ticketTracking.update({
                    where: { id: ticketTraking.id },
                    data: { queuedAt: moment().toDate() }
                });
            }

            const currentTicket = await ShowTicket(ticket.id, ticket.companyId);

            io.to(ticket.status)
                .to("notification")
                .to(ticket.id.toString())
                .emit(`company-${ticket.companyId}-ticket`, {
                    action: "update",
                    ticket: currentTicket,
                    traking: "created ticket 33"
                });

            logger.info(`Transferência de ticket automática ticket id ${ticket.id} para a fila ${wpp.transferQueueId}`);
        }
    });
};
