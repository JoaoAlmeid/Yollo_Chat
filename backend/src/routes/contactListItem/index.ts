import { Router } from 'express'
import ContactListItemController from '../../controllers/contactListItem'
import isAuth from 'src/middlewares/isAuth'

const contactListItemRoutes = Router()

contactListItemRoutes.get('/lista_contatos/items/lista', isAuth, ContactListItemController.find)
contactListItemRoutes.get('/lista_contatos/items', isAuth, ContactListItemController.index)
contactListItemRoutes.get('/lista_contatos/items/:id', isAuth, ContactListItemController.show)
contactListItemRoutes.post('/lista_contatos/items', isAuth, ContactListItemController.store)
contactListItemRoutes.put('/lista_contatos/items/:id', isAuth, ContactListItemController.update)
contactListItemRoutes.delete('/lista_contatos/items/:id', isAuth, ContactListItemController.delete)

export default contactListItemRoutes