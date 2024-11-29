import { Router } from 'express'
import QueueController from '../../controllers/queue'
import isAuth from 'src/middlewares/isAuth'

const queuesRoutes = Router()
queuesRoutes.use(isAuth)

queuesRoutes.get('/fila', QueueController.index)
queuesRoutes.post('/fila', QueueController.store)
queuesRoutes.get('/fila/:queueId', QueueController.show)
queuesRoutes.put('/fila/:queueId', QueueController.update)
queuesRoutes.delete('/fila/:queueId', QueueController.delete)

export default queuesRoutes