import './bootstrap'
import 'reflect-metadata'
import 'express-async-errors'
import 'tsconfig-paths/register'

import express, { Request, Response, NextFunction } from 'express'
import * as Sentry from '@sentry/node'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import upload from './configs/upload'
import AppError from './errors/AppError'
import routes from './routes'
import { logger } from './utils/Logger'
import { messageQueue, sendScheduledMessages } from './queues'

Sentry.init({ dsn: process.env.SENTRY_DSN })

const app = express()

app.set('queues', { messageQueue, sendScheduledMessages })
app.use(cors ({ credentials: true, origin: process.env.FRONTEND_URL }))

app.use(cookieParser())
app.use(express.json())
Sentry.setupExpressErrorHandler(app)

// Middleware para servir arquivos estáticos
app.use('/public', express.static(upload.directory))

// Rotas da aplicação
app.use(routes)

// Tratamento de erros personalizados
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err)
    return res.status(err.statusCode || 500).json({ error: err.message })
  }

  logger.error(err)
  return res.status(500).json({ error: 'Erro interno no Servidor' })
})

export default app
