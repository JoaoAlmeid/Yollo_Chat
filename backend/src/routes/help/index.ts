import { Router } from 'express'
import HelpController from '../../controllers/help'
import isAuth from 'src/middlewares/isAuth'

const helpRoutes = Router()
helpRoutes.use(isAuth)

helpRoutes.get('/ajuda/lista', HelpController.findList)

helpRoutes.get('/ajuda', HelpController.index)
helpRoutes.post('/ajuda', HelpController.store)

helpRoutes.get('/ajuda/:id', HelpController.show)
helpRoutes.put('/ajuda/:id', HelpController.update)
helpRoutes.delete('/ajuda/:id', HelpController.delete)

export default helpRoutes