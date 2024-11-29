import { Router } from 'express'
import isAuth from 'src/middlewares/isAuth'
import announcementController from '../../controllers/announcement'
import multer from 'multer'
import uploadConfig from 'src/configs/upload'

const upload = multer(uploadConfig)
const announcementsRoutes = Router()

announcementsRoutes.get("/anuncios/lista", isAuth, announcementController.findList)

announcementsRoutes.get('/anuncios', isAuth, announcementController.index)

announcementsRoutes.get("/anuncios/:id", isAuth, announcementController.show)

announcementsRoutes.post('/anuncios', isAuth, announcementController.store)

announcementsRoutes.put("/anuncios/:id", isAuth, announcementController.update)

announcementsRoutes.delete("/anuncios/:id", isAuth, announcementController.delete)

announcementsRoutes.post(
    "/anuncios/:id/arquivos", 
    isAuth, 
    upload.array("file"),
    announcementController.mediaUpload
)

announcementsRoutes.delete(
    "/anuncios/:id/arquivos", 
    isAuth, 
    announcementController.deleteMedia
)

export default announcementsRoutes
