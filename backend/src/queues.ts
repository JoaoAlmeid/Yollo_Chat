import moment from 'moment'
import { logger } from './utils/Logger'
import handlePrepareContact from './queues/handle/handlePrepareContact'
import handleSendMessage from './queues/handle/handleSendMessage'
import handleVerifySchedules from './queues/handle/handleVerifySchedules'
import handleSendScheduledMessage from './queues/handle/handleSendScheduledMessage'
import handleVerifyCampaigns from './queues/handle/handleVerifyCampaigns'
import handleProcessCampaign from './queues/handle/handleProcessCampaign'
import handleDispatchCampaign from './queues/handle/handleDispatchCampaign'
import handleLoginStatus from './queues/handle/handleLoginStatus'
import handleVerifyQueue from './queues/handle/handleVerifyQueue'
import Bull from 'bull'

const connection = process.env.REDIS_URI || ''
const limiterMax = Number(process.env.REDIS_OPT_LIMITER_MAX) || 1
const limiterDuration = Number(process.env.REDIS_OPT_LIMITER_DURATION) || 3000

// Inicializando as filas
export const userMonitor = new Bull('UserMonitor', connection)
export const queueMonitor = new Bull('QueueMonitor', connection)
export const messageQueue = new Bull('MessageQueue', connection, {
  limiter: {
    max: limiterMax,
    duration: limiterDuration,
  },
})
export const scheduleMonitor = new Bull('ScheduleMonitor', connection)
export const sendScheduledMessages = new Bull('SendScheduledMessages', connection)
export const campaignQueue = new Bull('CampaignQueue', connection)

// Função para converter segundos para milissegundos
export function parseToMilliseconds(seconds: number): number {
  return seconds * 1000
}

// Função para criar uma pausa (sleep) no processamento
export async function sleep(seconds: number): Promise<void> {
  logger.info(
    `Sleep de ${seconds} segundos iniciado: ${moment().format('HH:mm:ss')}`
  )
  return new Promise(resolve => {
    setTimeout(() => {
      logger.info(
        `Sleep de ${seconds} segundos finalizado: ${moment().format('HH:mm:ss')}`
      )
      resolve()
    }, parseToMilliseconds(seconds))
  })
}

// Função para gerar um valor aleatório entre um mínimo e um máximo
export function randomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

// Função para iniciar o processamento das filas
export async function startQueueProcess(): Promise<void> {
  logger.info('Iniciando processamento de filas')

  // Definindo os processadores para as filas
  messageQueue.process('SendMessage', handleSendMessage)
  scheduleMonitor.process('Verify', handleVerifySchedules)
  sendScheduledMessages.process('SendMessage', handleSendScheduledMessage)
  campaignQueue.process('PrepareContact', handlePrepareContact)
  campaignQueue.process('VerifyCampaigns', handleVerifyCampaigns)
  campaignQueue.process('ProcessCampaign', handleProcessCampaign)
  campaignQueue.process('DispatchCampaign', handleDispatchCampaign)
  userMonitor.process('VerifyLoginStatus', handleLoginStatus)
  queueMonitor.process('VerifyQueueStatus', handleVerifyQueue)

  // Adicionando jobs recorrentes às filas
  scheduleMonitor.add(
    'Verify',
    {},
    {
      repeat: { cron: '*/5 * * * * *' }, // A cada 5 segundos
      removeOnComplete: true,
    }
  )

  campaignQueue.add(
    'VerifyCampaigns',
    {},
    {
      repeat: { cron: '*/20 * * * * *' }, // A cada 20 segundos
      removeOnComplete: true,
    }
  )

  userMonitor.add(
    'VerifyLoginStatus',
    {},
    {
      repeat: { cron: '* * * * *' }, // A cada minuto
      removeOnComplete: true,
    }
  )
}
