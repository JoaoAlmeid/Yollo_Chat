import { Router } from 'express'
import QueueOptionsController from 'src/controllers/queueOptions'
import isAuth from 'src/middlewares/isAuth'

const queueOptionsRoutes = Router()
queueOptionsRoutes.use(isAuth)

queueOptionsRoutes.get('/fila/opcoes', QueueOptionsController.index)
queueOptionsRoutes.post('/fila/opcoes', QueueOptionsController.store)
queueOptionsRoutes.get('/fila/opcoes/:queueOptionId', QueueOptionsController.show)
queueOptionsRoutes.put('/fila/opcoes/:queueOptionId', QueueOptionsController.update)
queueOptionsRoutes.delete('/fila/opcoes/:queueOptionId', QueueOptionsController.delete)

export default queueOptionsRoutes