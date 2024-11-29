import { Router } from 'express';
import ContactController from '../../controllers/contact';
import isAuth from '../../middlewares/isAuth';
import importPhone from 'src/controllers/importPhone';

const contactRoutes = Router();

contactRoutes.post('/contatos/importar', isAuth, importPhone.store)
contactRoutes.get('/contatos', isAuth, ContactController.index);
contactRoutes.get('/contatos/lista', isAuth, ContactController.list);
contactRoutes.get('/contatos/:contactId', isAuth, ContactController.show);
contactRoutes.post('/contatos', isAuth, ContactController.store);
contactRoutes.put('/contatos/:contactId', isAuth, ContactController.update);
contactRoutes.delete('/contatos/:contactId', isAuth, ContactController.delete);

export default contactRoutes;