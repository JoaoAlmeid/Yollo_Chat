import { createWriteStream, WriteStream } from 'fs'
import { join } from 'path'
import { pino, Logger as PinoLogger } from 'pino'

let logStream: WriteStream

export const setupLogFile = (filePath: string): void => {
  logStream = createWriteStream(join(__dirname, filePath), { flags: 'a' })
}

// Função auxiliar para obter o timestamp atual
const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}

// Função auxiliar para registrar no arquivo de log
const logToFile = (message: string): void => {
  if (logStream) {
    logStream.write(`${message}\n`)
  }
}

export const logger: PinoLogger = pino({
  transport: {
    target: 'pino-pretty',
  },
})

logger.info = (message: unknown): void => {
  console.log(`[INFO] ${getCurrentTimestamp()} - ${message}`)
  logToFile(`[INFO] ${getCurrentTimestamp()} - ${message}`)
}

logger.error = (message: unknown): void => {
  console.error(`[ERROR] ${getCurrentTimestamp()} - ${message}`)
  logToFile(`[ERROR] ${getCurrentTimestamp()} - ${message}`)
}

logger.warn = (message: unknown): void => {
  console.warn(`[WARN] ${getCurrentTimestamp()} - ${message}`)
  logToFile(`[WARN] ${getCurrentTimestamp()} - ${message}`)
}

logger.fatal = (message: unknown): void => {
  console.error(`[FATAL] ${getCurrentTimestamp()} - ${message}`)
  logToFile(`[FATAL] ${getCurrentTimestamp()} - ${message}`)
}

logger.debug = (message: unknown): void => {
  console.debug(`[DEBUG] ${getCurrentTimestamp()} - ${message}`)
  logToFile(`[DEBUG] ${getCurrentTimestamp()} - ${message}`)
}

logger.trace = (message: unknown): void => {
  console.trace(`[TRACE] ${getCurrentTimestamp()} - ${message}`)
  logToFile(`[TRACE] ${getCurrentTimestamp()} - ${message}`)
}
