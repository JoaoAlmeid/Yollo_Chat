import express from 'express'
import dashboardController from '../../controllers/dashboard'
import isAuth from 'src/middlewares/isAuth'

const dashboardRoutes = express.Router()

dashboardRoutes.get('/:companyId', isAuth, dashboardController.index)

export default dashboardRoutes
