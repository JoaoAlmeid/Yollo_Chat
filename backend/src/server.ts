import GracefulShutdown from 'http-graceful-shutdown'
import app from './app'
import { ensureIOInitialized, initIO } from './libs/socket'
import { logger } from './utils/Logger'
import StartAllWhatsAppsSessions from './services/wbot/StartAllWhatsAppsSessions'
import { TransferTicketQueue } from './wbotTransferTicketQueue'
import { startQueueProcess } from './queues'
import prisma from './prisma/client'
import cron from 'node-cron'
import { resolve } from 'path'
const PORT = process.env.PORT || 3006

const server = app.listen(PORT, async () => {
  try {
    initIO(server)
    await ensureIOInitialized()
    
    const companies = await prisma.company.findMany()
    await Promise.all(companies.map((c) => StartAllWhatsAppsSessions(c.id)))

    startQueueProcess()
    logger.info(`Servidor iniciado na porta: ${PORT}`)
  } catch (error: any) {
    logger.error(`Erro ao iniciar o servidor: ${error.message}`)
    process.exit(1)
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  let transferQueueInProgress = false;

  // Inicia o cron job para transferência de tickets a cada minuto
  cron.schedule("* * * * *", async () => {
    if (transferQueueInProgress) {
      logger.warn("Tentativa de iniciar a transferência de tickets enquanto outra está em andamento.")
      return;
    }

    transferQueueInProgress = true;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        logger.info(`Transferência de tickets iniciada (Tentativa ${i + 1})`);
        await TransferTicketQueue()
        break;
      } catch (err) {
        logger.warn(`Erro na de transferência de tickets. Tentando novamente em ${RETRY_DELAY / 1000} segundos...`, err)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        } else {
          logger.error("Erro na transferência de tickets após múltiplas tentativas: ", err)
        }
      } finally {
        transferQueueInProgress = false;
      }
    }
  })
})

// Configura o shutdown
GracefulShutdown(server, {
  signals: 'SIGINT SIGTERM',
  timeout: 30000,
  onShutdown: async () => {
    logger.info('Iniciando o encerramento do servidor...');

    // Encerra sessões do WhatsApp ou outras conexões
    await prisma.$disconnect();
    logger.info("Conexão com o banco de dados encerrada.");
  },
  finally: () => {
    logger.info('Servidor encerrado')
  }
})