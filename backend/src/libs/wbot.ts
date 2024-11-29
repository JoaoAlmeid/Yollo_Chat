import * as Sentry from '@sentry/node'
import makeWASocket, { 
  Browsers, 
  CacheStore, 
  DisconnectReason, 
  fetchLatestBaileysVersion, 
  isJidBroadcast, 
  makeCacheableSignalKeyStore, 
  makeInMemoryStore, 
  WASocket
} from '@whiskeysockets/baileys'

import prisma from '../prisma/client'
import { Contact, Whatsapp } from '@prisma/client'
import { logger } from '../utils/Logger'
import MAIN_LOGGER from '@whiskeysockets/baileys/lib/Utils/logger'
import authState from '../helpers/authState'
import { Boom } from '@hapi/boom'
import AppError from '../errors/AppError'
import { ensureIOInitialized, getIO } from './socket'
import { StartWhatsAppSession } from '../services/wbot/StartWhatsAppSession'
import DeleteBaileysService from '../services/baileys/DeleteBaileys'
import NodeCache from 'node-cache'
import { MyStore } from '../@types/Store'

type Session = WASocket & {
  id?: number
  store?: MyStore
  user?: Contact
  register: (code: string) => Promise<void>
  requestRegistrationCode?: (
    registrationOptions?: RegistrationOptions
  ) => Promise<void>
}

const loggerBaileys = MAIN_LOGGER.child({})
loggerBaileys.level = "error"

const sessions: Session[] = []
const retriesQrCodeMap = new Map<number, number>()

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId)

  if (sessionIndex === -1) {
    throw new AppError("Erro: WhatsApp não iniciado")
  }
  return sessions[sessionIndex]
}

export const removeWbot = async (whatsappId: number, isLogout = true): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId)
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout()
        sessions[sessionIndex].ws.close()
      }

      sessions.splice(sessionIndex, 1)
    }
  } catch (error: any) {
    logger.error(error)
  }
}

export const initWASocket = async ( whatsapp: Whatsapp ): Promise<Session> => {
  try {
    await ensureIOInitialized()
    const io = getIO()

    const whatsappUpdate = await prisma.whatsapp.findUnique({ where: { id: whatsapp.id } })
    if (!whatsappUpdate) return

    const { id, name, provider } = whatsappUpdate
    const { version, isLatest } = await fetchLatestBaileysVersion()
    const isLegacy = provider === "stable" ? true : false

    logger.info(`Usando WA v${version.join(".")}, recente: ${isLatest}`)
    logger.info(`isLegacy: ${isLegacy}`)
    logger.info(`Iniciando sessão: ${name}`)

    let retriesQrCode = 0

    const store = makeInMemoryStore({ logger: loggerBaileys })
    const { state, saveState } = await authState(whatsapp)
    const msgRetryCounterCache = new NodeCache()
    const userDevicesCache: CacheStore = new NodeCache()

    const wsocket = makeWASocket({
      logger: loggerBaileys,
      printQRInTerminal: false,
      browser: Browsers.appropriate("Desktop"),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      version: [2,2413,1],
      msgRetryCounterCache,
      shouldIgnoreJid: jid => isJidBroadcast(jid),
    })
    wsocket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
      await handleConnectionUpdate(connection, lastDisconnect, qr, id, name, whatsapp, io, wsocket as Session, retriesQrCode)
    });
    wsocket.ev.on("creds.update", saveState);
    store.bind(wsocket.ev)

    return wsocket as Session
  } catch (error: any) {
    Sentry.captureException(error);
    logger.error(error);
    throw new Error("Erro ao inicializar o WhatsApp");
  }
}

const handleConnectionUpdate = async (
  connection: string,
  lastDisconnect: any,
  qr: string,
  id: number,
  name: string,
  whatsapp: Whatsapp,
  io: any,
  wsocket: Session,
  retriesQrCode: number
) => {
  if (connection === "close") {
    if ((lastDisconnect?.error as Boom)?.output?.statusCode === 403) {
      await handleDisconnect403(whatsapp, io, id);
    } else if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
      await handleReconnection(whatsapp, io, id);
    } else {
      await handleReconnection(whatsapp, io, id);
    }
  }

  if (connection === "open") {
    await handleConnectionOpen(whatsapp, io, id, wsocket);
  }

  if (qr !== undefined) {
    await handleQRCode(qr, id, name, whatsapp, io, wsocket, retriesQrCode);
  }
};

const handleDisconnect403 = async (whatsapp: Whatsapp, io: any, id: number) => {
  await prisma.whatsapp.update({
    where: { id: whatsapp.id },
    data: {
      status: "PENDING",
      session: "",
    },
  });
  await DeleteBaileysService(whatsapp.id);
  io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
    action: "update",
    session: whatsapp,
  });
  removeWbot(id, false);
};

const handleReconnection = async (whatsapp: Whatsapp, io: any, id: number) => {
  removeWbot(id, false);
  setTimeout(
    () => StartWhatsAppSession(whatsapp, whatsapp.companyId),
    2000
  );
};

const handleConnectionOpen = async (whatsapp: Whatsapp, io: any, id: number, wsocket: Session) => {
  await prisma.whatsapp.update({
    where: { id: whatsapp.id },
    data: {
      status: "CONNECTED",
      qrcode: "",
      retries: 0,
    },
  });

  io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
    action: "update",
    session: whatsapp,
  });

  const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
  if (sessionIndex === -1) {
    wsocket.id = whatsapp.id;
    sessions.push(wsocket);
  }
};

const handleQRCode = async (
  qr: string,
  id: number,
  name: string,
  whatsapp: Whatsapp,
  io: any,
  wsocket: Session,
  retriesQrCode: number
) => {
  if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
    const whatsappUpdate = await prisma.whatsapp.update({
      where: { id: whatsapp.id },
      data: {
        status: "DISCONNECTED",
        qrcode: "",
      },
    });
    await DeleteBaileysService(whatsappUpdate.id);
    io.emit("whatsappSession", {
      action: "update",
      session: whatsappUpdate,
    });
    wsocket.ev.removeAllListeners("connection.update");
    wsocket.ws.close();
    retriesQrCodeMap.delete(id);
  } else {
    logger.info(`Session QRCode Generate ${name}`);
    retriesQrCodeMap.set(id, (retriesQrCodeMap.get(id) || 0) + 1);

    await prisma.whatsapp.update({
      where: { id: whatsapp.id },
      data: {
        qrcode: qr,
        status: "qrcode",
        retries: retriesQrCodeMap.get(id),
      },
    });

    io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp,
    });
  }
};
