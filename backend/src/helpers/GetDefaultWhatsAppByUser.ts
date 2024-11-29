import { Whatsapp } from "@prisma/client"
import prisma from "../prisma/client"
import { logger } from "../utils/Logger"

const GetDefaultWhatsAppByUser = async ( userId: number ): Promise<Whatsapp | null> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { whatsapp: true }})
        if (!user || !user.whatsapp) { return null }

        logger.info(`WhatsApp encontrado vinculado ao usuário '${user.name}' é '${user.whatsapp.name}'.`)
        return user.whatsapp
    } catch (error: any) {
        logger.error(`Erro ao buscar usuário '${userId}': ${error.message}`)
        throw error
    }
}

export default GetDefaultWhatsAppByUser