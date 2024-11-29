import { Router } from 'express'
import TicketController from '../../controllers/ticket'
import isAuth from 'src/middlewares/isAuth'

const ticketRoutes = Router()
ticketRoutes.use(isAuth)

ticketRoutes.get('/ticket', TicketController.index)
ticketRoutes.post('/ticket', TicketController.store)

ticketRoutes.get('/ticket/:ticketId', TicketController.show)
ticketRoutes.put('/ticket/:ticketId', TicketController.update)
ticketRoutes.delete('/ticket/:ticketId', TicketController.delete)

ticketRoutes.get('/ticket/kanban', TicketController.kanban)
ticketRoutes.get('/ticket/u/:uuid', TicketController.showFromUUID)

export default ticketRoutes