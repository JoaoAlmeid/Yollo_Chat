import { Router } from 'express'
import QueueIntegrationController from 'src/controllers/queueIntegration'
import isAuth from 'src/middlewares/isAuth'

const queueIntegrationsRoutes = Router()
queueIntegrationsRoutes.use(isAuth)

queueIntegrationsRoutes.get('/fila/integracao', QueueIntegrationController.index)
queueIntegrationsRoutes.post('/fila/integracao', QueueIntegrationController.store)
queueIntegrationsRoutes.get('/fila/integracao/:integrationId', QueueIntegrationController.show)
queueIntegrationsRoutes.put('/fila/integracao/:integrationId', QueueIntegrationController.update)
queueIntegrationsRoutes.delete('/fila/integracao/:integrationId', QueueIntegrationController.delete)

export default queueIntegrationsRoutes
