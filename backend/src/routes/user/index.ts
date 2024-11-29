import { Router } from 'express'
import UserController from '../../controllers/user' 
import isAuth from 'src/middlewares/isAuth'

const userRoutes = Router()
userRoutes.use(isAuth)

userRoutes.get('/usuarios', UserController.index)
userRoutes.post('/usuarios', UserController.store)

userRoutes.get('/usuarios/lista', UserController.list)

userRoutes.put('/usuarios/:userId', UserController.update)
userRoutes.get('/usuarios/:userId', UserController.show)
userRoutes.delete('/usuarios/:userId', UserController.delete)

export default userRoutes