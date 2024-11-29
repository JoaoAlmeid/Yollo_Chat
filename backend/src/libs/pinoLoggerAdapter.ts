import pino, { Logger as PinoLogger } from 'pino'

const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}

export const logger: PinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

logger.info = (message: unknown): void => {
  console.log(`[INFO] ${getCurrentTimestamp()} - ${message}`)
}

logger.error = (message: unknown): void => {
  console.error(`[ERROR] ${getCurrentTimestamp()} - ${message}`)
}

logger.warn = (message: unknown): void => {
  console.warn(`[WARN] ${getCurrentTimestamp()} - ${message}`)
}

logger.fatal = (message: unknown): void => {
  console.error(`[FATAL] ${getCurrentTimestamp()} - ${message}`)
}

logger.debug = (message: unknown): void => {
  console.debug(`[DEBUG] ${getCurrentTimestamp()} - ${message}`)
}

logger.trace = (message: unknown): void => {
  console.trace(`[TRACE] ${getCurrentTimestamp()} - ${message}`)
}

logger.silent = (): void => {
  // No-op
}
