import { Router } from 'express'
import Companycontroller from 'src/controllers/company'
import isAuth from 'src/middlewares/isAuth'

const companyRoutes = Router()

companyRoutes.get('/empresas/lista', isAuth, Companycontroller.list)
companyRoutes.get('/empresas', isAuth, Companycontroller.index)
companyRoutes.get('/empresas/:id', isAuth, Companycontroller.show)
companyRoutes.post('/empresas', isAuth, Companycontroller.store)
companyRoutes.put('/empresas/:id', isAuth, Companycontroller.update)
companyRoutes.put('/empresas/:id/agendamento', isAuth, Companycontroller.updateSchedules)
companyRoutes.delete('/empresas/:id', isAuth, Companycontroller.delete)
companyRoutes.post('/empresas/cadastro', Companycontroller.store)
companyRoutes.get('/empresas/planos/:id', isAuth, Companycontroller.listPlan)
companyRoutes.get('/planos-empresa', isAuth, Companycontroller.indexPlan)

export default companyRoutes