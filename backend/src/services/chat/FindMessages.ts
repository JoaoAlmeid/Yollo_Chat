import prisma from "../../prisma/client"
import AppError from "../../errors/AppError"
import { sortBy } from "lodash"
import { RequestChat, ResponseFind } from "./types"


const FindMessages = async ({ chatId, ownerId, pageNumber = "1" }: RequestChat): Promise<ResponseFind> => {
    try {
        // Verifica se o usuário está no chat
        const userInChat = await prisma.chatUser.count({
            where: { chatId: +chatId, userId: ownerId }
        });
    
        if (userInChat === 0) {
            throw new AppError("UNAUTHORIZED", 400)
        }
        
        const limit = 20
        const page = Number(pageNumber)
        const offset = limit * (page - 1)

        const [ records, count ] = await Promise.all([
            prisma.chatMessage.findMany({
                where: { chatId: +chatId },
                include: {
                    sender: { select: { id: true, name: true }}
                },
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.chatMessage.count({
                where: { chatId: +chatId }
            })
        ])

        const hasMore = count > offset + records.length
        const sorted = sortBy(records, ["id", "ASC"])
     
        return {
            records: sorted,
            count,
            hasMore
        }
    } catch (error) {
        console.error(`Erro ao buscar mensagens: ${error.message}`)
        throw new AppError(`Erro interno ao buscar mensagens: ${error.message}`, 500)
    }
}

export default FindMessages