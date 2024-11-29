import { Router } from 'express'
import TicketTagController from '../../controllers/ticketTag'
import isAuth from 'src/middlewares/isAuth'

const ticketTagRoutes = Router()
ticketTagRoutes.use(isAuth)

ticketTagRoutes.post('/ticket/tags/:ticketId/:tagId', TicketTagController.store)
ticketTagRoutes.delete('/ticket/tags/:ticketId', TicketTagController.delete)

export default ticketTagRoutes