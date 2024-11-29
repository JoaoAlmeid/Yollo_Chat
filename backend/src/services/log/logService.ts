import AppError from "src/errors/AppError";
import prisma from "src/prisma/client";

// Tipagem para retorno da função logAction
interface ActionLogResponse {
    id: number;
    userId: number;
    ticketId: number | null;
    action: string;
    message: string | null;
    createdAt: Date;
}

async function LogAction(
    userId: number,
    action: string,
    ticketId: number | null = null,
    message: string,
    level: string = 'INFO'
): Promise<ActionLogResponse> {
    try {
        // Criar Log da ação
        const actionLog = await prisma.action_Logs.create({
            data: { userId, ticketId, action, message }
        })

        // Se o nível do log for 'ERROR', registrar no SystemLogs
        if (level === 'ERROR') {
            await prisma.system_Logs.create({
                data: {
                    level: level,
                    message: message || 'Erro no sistema',
                    actionLogId: actionLog.id
                }
            })
        }

        return actionLog;
    } catch (error) {
        console.error(`Erro as registrar log de ação: ${error}`)
        throw new AppError(`Erro ao registrar log: ${error.message}`, 500)
    }
}

export { LogAction }