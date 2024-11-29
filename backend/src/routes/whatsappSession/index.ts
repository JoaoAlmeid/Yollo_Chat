import { Router } from 'express'
import WhatsAppSessionController from '../../controllers/whatsappSession'
import isAuth from 'src/middlewares/isAuth'

const whatsappSessionRoutes = Router()
whatsappSessionRoutes.use(isAuth)

whatsappSessionRoutes.post('/sessao/:whatsappId', WhatsAppSessionController.store)
whatsappSessionRoutes.put('/sessao/:whatsappId', WhatsAppSessionController.update)
whatsappSessionRoutes.delete('/sessao/:whatsappId', WhatsAppSessionController.delete)

export default whatsappSessionRoutes