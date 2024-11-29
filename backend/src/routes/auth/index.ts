import { Router } from 'express'
import SessionController from 'src/controllers/session'
import UserController from 'src/controllers/user'
import isAuth from 'src/middlewares/isAuth'
import envTokenAuth from 'src/middlewares/envTokenAuth'

const authRoutes = Router()

// Rota para registrar um novo usuário
authRoutes.post('/registrar', envTokenAuth, UserController.store)

// Rota para login do usuário
authRoutes.post('/login', SessionController.store)

// Rota para atualizar o token
authRoutes.post('/atualizar-token', isAuth, SessionController.update)

// Rota para logout do usuário
authRoutes.delete('/sair', isAuth, SessionController.delete)

// Rota para obter informações sobre o usuário autenticado
authRoutes.get('/me', isAuth, SessionController.me)

export default authRoutes
