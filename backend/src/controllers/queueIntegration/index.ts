import AppError from "../../errors/AppError";
import { Request, Response } from "express";
import { getIO } from "../../libs/socket";

import CreateQueueIntegrationService from "src/services/queueIntegration/CreateQueueIntegrationService"
import DeleteQueueIntegrationService from "src/services/queueIntegration/DeleteQueueIntegrationService"
import ListQueueIntegrationService from "src/services/queueIntegration/ListQueueIntegrationService"
import ShowQueueIntegrationService from "src/services/queueIntegration/ShowQueueIntegrationService"
import UpdateQueueIntegrationService from "src/services/queueIntegration/UpdateQueueIntegrationService"

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
};

class QueueIntegrationsController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const { searchParam = '', pageNumber = '1' } = req.query as IndexQuery;
      const { companyId } = req.user!;
  
      const { queueIntegrations, count, hasMore } = await ListQueueIntegrationService({
        searchParam,
        pageNumber,
        companyId
      });
  
      return res.status(200).json({ queueIntegrations, count, hasMore });
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar integrações da fila" })
      throw new AppError(`Ocorreu um erro ao recuperar integrações da fila: ${error.message}`, 500)
    }
  }

  public async store(req: Request, res: Response): Promise<Response> {
    try {
      const { type, name, projectName, jsonContent, language, urlN8N,
        typebotExpires,
        typebotKeywordFinish,
        typebotSlug,
        typebotUnknownMessage,
        typebotKeywordRestart,
        typebotRestartMessage } = req.body;
      const { companyId } = req.user!;
  
      const queueIntegration = await CreateQueueIntegrationService({
        type, name, projectName, jsonContent, language, urlN8N, companyId,
        typebotExpires,
        typebotKeywordFinish,
        typebotSlug,
        typebotUnknownMessage,
        typebotKeywordRestart,
        typebotRestartMessage
      });
  
      const io = getIO();
      io.emit(`company-${companyId}-queueIntegration`, {
        action: "create",
        queueIntegration
      });
  
      return res.status(201).json(queueIntegration);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar integração da fila" })
      throw new AppError(`Ocorreu um erro ao criar integração da fila: ${error.message}`, 500)
    }
  }

  public async show(req: Request, res: Response): Promise<Response> {
    try {
      const { integrationId } = req.params;
      const { companyId } = req.user!;
  
      const queueIntegration = await ShowQueueIntegrationService(integrationId, companyId);
  
      return res.status(200).json(queueIntegration);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao exibir integração da fila" })
      throw new AppError(`Ocorreu um erro ao exibir integração da fila: ${error.message}`, 500)
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { integrationId } = req.params;
      const integrationData = req.body;
      const { companyId } = req.user!;
  
      const queueIntegration = await UpdateQueueIntegrationService({ integrationData, integrationId, companyId });
  
      const io = getIO();
      io.emit(`company-${companyId}-queueIntegration`, {
        action: "update",
        queueIntegration
      });
  
      return res.status(200).json(queueIntegration);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao atualizar integração da fila" })
      throw new AppError(`Ocorreu um erro ao atualizar integração da fila: ${error.message}`, 500)
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { integrationId } = req.params;
      const { companyId } = req.user!;
  
      await DeleteQueueIntegrationService(Number(integrationId));
  
      const io = getIO();
      io.emit(`company-${companyId}-queueIntegration`, {
        action: "delete",
        integrationId: +integrationId
      });
  
      return res.status(200).json({
        message: "Integração deletada"
      });
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao deletar integração da fila" })
      throw new AppError(`Ocorreu um erro ao deletar integração da fila: ${error.message}`, 500)
    }
  }
}

export default new QueueIntegrationsController();