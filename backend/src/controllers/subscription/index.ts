import { Request, Response } from "express";
import * as Yup from "yup";
import Gerencianet from "gn-api-sdk-typescript";
import AppError from "../../errors/AppError";
import options from "src/configs/Gn";
import { getIO } from "../../libs/socket";
import prisma from "../../prisma/client";

const schema = Yup.object().shape({
  price: Yup.string().required(),
  users: Yup.string().required(),
  connections: Yup.string().required(),
});


class SubscriptionController {
  private gerencianet;

  constructor() {
    this.gerencianet = new Gerencianet(options);
  }

  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const subscriptions = await this.gerencianet.getSubscriptions();
      return res.json(subscriptions);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao recuperar assinatura" })
      throw new AppError(`Ocorreu um erro ao recuperar assinatura: ${error.message}`, 500)
    }
  }

  public async createSubscription(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;

    if (!(await schema.isValid(req.body))) {
      throw new AppError("Falha na validação", 400);
    }

    const { price, users, connections, invoiceId } = req.body;

    const body = {
      calendario: {
        expiracao: 3600,
      },
      valor: {
        original: price.toLocaleString("pt-br", { minimumFractionDigits: 2 }).replace(",", "."),
      },
      chave: process.env.GERENCIANET_PIX_KEY,
      solicitacaoPagador: `#Fatura:${invoiceId}`,
    };

    try {
      const pix = await this.gerencianet.pixCreateImmediateCharge(null, body);
      const qrcode = await this.gerencianet.pixGenerateQRCode({ id: pix.loc.id });

      const company = await prisma.company.findUnique({ where: { id: companyId } });

      if (!company) {
        throw new AppError("Empresa não encontrada", 404);
      }

      await prisma.subscription.create({
        data: {
          companyId,
          isActive: false,
          userPriceCents: parseInt(users),
          whatsPriceCents: parseInt(connections),
          lastInvoiceUrl: pix.location,
          lastPlanChange: new Date(),
          providerSubscriptionId: pix.loc.id,
          expiresAt: new Date(),
        },
      });

      return res.status(200).json({ ...pix, qrcode });
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar assinatura" })
      throw new AppError(`Ocorreu um erro ao criar assinatura: ${error.message}`, 500)
    }
  }

  public async createWebhook(req: Request, res: Response): Promise<Response> {
    const schema = Yup.object().shape({
      chave: Yup.string().required(),
      url: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      throw new AppError("Validation fails", 400);
    }

    const { chave, url } = req.body;

    const body = { webhookUrl: url };
    const params = { chave };

    try {
      const create = await this.gerencianet.pixConfigWebhook(params, body);
      return res.status(200).json(create);
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro ao criar WebHook" })
      throw new AppError(`Ocorreu um erro ao criar WebHook: ${error.message}`, 500)
    }
  }

  public async webhook(req: Request, res: Response): Promise<Response> {
    try {
      const { evento } = req.body;
  
      if (evento === "teste_webhook") {
        return res.json({ ok: true });
      }
  
      if (req.body.pix) {
        req.body.pix.forEach(async (pix: any) => {
          const detalhe = await this.gerencianet.pixDetailCharge({ txid: pix.txid });
  
          if (detalhe.status === "CONCLUIDA") {
            const invoiceID = detalhe.solicitacaoPagador.replace("#Fatura:", "");
            const invoice = await prisma.invoice.findUnique({ where: { id: parseInt(invoiceID) } });
  
            if (invoice) {
              const companyId = invoice.companyId;
              const company = await prisma.company.findUnique({ where: { id: companyId } });
  
              if (company) {
                const expiresAt = new Date(company.dueDate);
                expiresAt.setDate(expiresAt.getDate() + 30);
  
                await prisma.company.update({
                  where: { id: companyId },
                  data: { dueDate: expiresAt.toISOString() },
                });
  
                await prisma.invoice.update({
                  where: { id: parseInt(invoiceID) },
                  data: { status: "paid" },
                });
  
                const io = getIO();
                io.emit(`company-${companyId}-payment`, {
                  action: detalhe.status,
                  company,
                });
              }
            }
          }
        });
      }
  
      return res.json({ ok: true });
    } catch (error: any) {
      console.error(error.message)
      res.status(500).json({ error: "Ocorreu um erro com o WebHook" })
      throw new AppError(`Ocorreu um erro com o WebHook: ${error.message}`, 500)
    }
  }
}

export default new SubscriptionController();