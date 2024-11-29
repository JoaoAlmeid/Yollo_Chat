import { Router } from 'express';
import MessageController from '../../controllers/message';
import isAuth from 'src/middlewares/isAuth';
import multer from 'multer';
import uploadConfig from 'src/configs/upload';
import tokenAuth from 'src/middlewares/tokenAuth';

const messageRoutes = Router();
const upload = multer(uploadConfig)

messageRoutes.get('/mensagens/:ticketId', isAuth, MessageController.index);
messageRoutes.post(
    '/mensagens/:ticketId', 
    upload.array("medias"),
    isAuth,
    MessageController.store
)
messageRoutes.delete('/mensagens/:messageId', isAuth, MessageController.delete)
messageRoutes.post(
    '/api/mensagens/enviar', 
    tokenAuth,
    upload.array('medias'),
    MessageController.send
)

export default messageRoutes;
