import { Router } from 'express'
import FilesController from 'src/controllers/files'
import multer from 'multer'
import isAuth from 'src/middlewares/isAuth'

const upload = multer({ dest: 'uploads/' })
const fileRoutes = Router()
fileRoutes.use(isAuth)

fileRoutes.get('/arquivos/lista', FilesController.list)

fileRoutes.get('/arquivos', FilesController.index)
fileRoutes.post('/arquivos', FilesController.store)
fileRoutes.delete('/arquivos', FilesController.removeAll)

fileRoutes.get('/arquivos/:fileId', FilesController.show)
fileRoutes.put('/arquivos/:fileId', FilesController.update)
fileRoutes.delete('/arquivos/:fileId', FilesController.delete)

fileRoutes.put(
    '/arquivos/atualizados/:fileListId', 
    upload.array('media'), 
    FilesController.uploadMedias
)

export default fileRoutes