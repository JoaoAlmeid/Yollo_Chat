import { initWASocket } from "../../libs/wbot";
import { Whatsapp } from "@prisma/client";
import wbotMessageListener from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/Logger";
import * as Sentry from "@sentry/node";
import prisma from "../../prisma/client";

export const StartWhatsAppSession = async (whatsapp: Whatsapp, companyId: number): Promise<void> => {
  try {
    await prisma.whatsapp.update({ 
      where: { id: whatsapp.id },
      data: { status: "OPENING" }
    });
  
    const io = getIO();
    io.emit("whatsappSession", {
      action: "update",
      session: whatsapp
    });
  
    const wbot = await initWASocket(whatsapp)

    if (!wbot || !wbot.user || !wbot.user.name) {
      throw new Error("Nome do usuário não definido no wbot")
    }
    
    wbotMessageListener(wbot, companyId);
    wbotMonitor(wbot, whatsapp, companyId);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
}