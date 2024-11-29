import { Router } from 'express'
import TicketNoteController from '../../controllers/ticketNote'
import isAuth from 'src/middlewares/isAuth'

const ticketNoteRoutes = Router()
ticketNoteRoutes.use(isAuth)

ticketNoteRoutes.get('/ticket/notas', TicketNoteController.index)
ticketNoteRoutes.post('/ticket/notas', TicketNoteController.store)

ticketNoteRoutes.get('/ticket/notas/:id', TicketNoteController.show)
ticketNoteRoutes.put('/ticket/notas/:id', TicketNoteController.update)
ticketNoteRoutes.delete('/ticket/notas/:id', TicketNoteController.delete)

export default ticketNoteRoutes