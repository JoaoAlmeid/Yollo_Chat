import { Request, Response } from "express";
import { LogAction } from "../../services/log/logService";

async function createActionLog(req: Request, res: Response): Promise<Response> {
    const { userId, action, ticketId, message, level } = req.body;

    try {
        const actionLog = await LogAction(userId, action, ticketId, message, level);

        return res.status(201).json({
            sucess: true,
            message: 'Ação registrada com sucesso',
            data: actionLog,
        })
    } catch (error) {
        console.error(`Erro no controller: ${error.message}`)
        return res.status(500).json({ sucess: false, message: 'Erro ao registrar ação' })
    }
}

export { createActionLog }