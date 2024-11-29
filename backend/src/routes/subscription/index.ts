import { Router } from 'express'
import SubscriptionController from '../../controllers/subscription' // Ajuste o caminho conforme a estrutura do seu projeto
import isAuth from 'src/middlewares/isAuth'

const subscriptionRoutes = Router()

subscriptionRoutes.post('/assinatura', isAuth, SubscriptionController.createSubscription)
subscriptionRoutes.post('/assinatura/criar/webhook', SubscriptionController.createWebhook)
subscriptionRoutes.post('/assinatura/webhook/:type?', SubscriptionController.webhook)

export default subscriptionRoutes