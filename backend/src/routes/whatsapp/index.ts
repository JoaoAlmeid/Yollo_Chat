import { Router } from 'express'
import WhatsappController from 'src/controllers/whatsapp'
import isAuth from 'src/middlewares/isAuth'

const whatsappRoutes = Router()
whatsappRoutes.use(isAuth)

whatsappRoutes.get('/whatsapp', WhatsappController.index)
whatsappRoutes.post('/whatsapp', WhatsappController.store)
whatsappRoutes.get('/whatsapp/:whatsappId', WhatsappController.show)
whatsappRoutes.put('/whatsapp/:whatsappId', WhatsappController.update)
whatsappRoutes.delete('/whatsapp/:whatsappId', WhatsappController.delete)

export default whatsappRoutes