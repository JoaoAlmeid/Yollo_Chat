import { Router } from 'express'
import QuickMessageController from '../../controllers/quickMessage'
import isAuth from 'src/middlewares/isAuth'
import uploadConfig from 'src/configs/upload'
import multer from 'multer'

const upload = multer(uploadConfig)
const quickMessagesRoutes = Router()
quickMessagesRoutes.use(isAuth)

quickMessagesRoutes.get('/mensagens-rapidas', QuickMessageController.index)
quickMessagesRoutes.post('/mensagens-rapidas', QuickMessageController.store)

quickMessagesRoutes.get('/mensagens-rapidas/lista', QuickMessageController.findList)

quickMessagesRoutes.get('/mensagens-rapidas/:id', QuickMessageController.show)
quickMessagesRoutes.put('/mensagens-rapidas/:id', QuickMessageController.update)
quickMessagesRoutes.delete('/mensagens-rapidas/:id', QuickMessageController.delete)

quickMessagesRoutes.post(
    '/mensagens-rapidas/:id/arquivos',
    upload.array("file"), 
    QuickMessageController.mediaUpload
)
quickMessagesRoutes.delete('/mensagens-rapidas/:id/arquivos', QuickMessageController.deleteMedia)

export default quickMessagesRoutes