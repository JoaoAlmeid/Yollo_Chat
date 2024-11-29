import { Router } from 'express'
import planController from '../../controllers/plan'
import isAuth from 'src/middlewares/isAuth'

const planRoutes = Router()

planRoutes.get('/planos', isAuth, planController.index)
planRoutes.post('/planos', isAuth, planController.store)

planRoutes.get('/planos/lista', planController.list)

planRoutes.get('/planos/todos', planController.list)

planRoutes.get('/planos/:id', isAuth, planController.show)
planRoutes.put('/planos/:id', isAuth, planController.update)
planRoutes.delete('/planos/:id', isAuth, planController.delete)

export default planRoutes
