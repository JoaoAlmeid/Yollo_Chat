import { Router } from 'express'
import InvoicesController from 'src/controllers/invoices'
import isAuth from 'src/middlewares/isAuth'

const invoiceRoutes = Router()
invoiceRoutes.use(isAuth)

invoiceRoutes.get('/faturas', InvoicesController.index)
invoiceRoutes.get('/faturas/lista', InvoicesController.list)
invoiceRoutes.get('/faturas/todas', InvoicesController.list)
invoiceRoutes.put('/faturas/:id', InvoicesController.update)

export default invoiceRoutes