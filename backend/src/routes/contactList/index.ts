import { Router } from 'express';
import ContactListController from '../../controllers/contactList';
import isAuth from 'src/middlewares/isAuth';
import multer from 'multer';
import uploadConfig from 'src/configs/upload';

const upload = multer(uploadConfig);
const contactListRoutes = Router();

contactListRoutes.get('/lista_contatos/lista', isAuth, ContactListController.find)

contactListRoutes.get('/lista_contatos', isAuth, ContactListController.index)

contactListRoutes.get('/lista_contatos/:id', isAuth, ContactListController.show)

contactListRoutes.post('/lista_contatos', isAuth, ContactListController.store)

contactListRoutes.post(
    '/lista_contatos/:id/importar', 
    isAuth, 
    upload.array('file'), 
    ContactListController.upload
)

contactListRoutes.put('/lista_contatos/:id', isAuth, ContactListController.update)

contactListRoutes.delete('/lista_contatos/:id', isAuth, ContactListController.delete)

export default contactListRoutes;
