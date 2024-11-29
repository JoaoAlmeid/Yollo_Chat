import { Router } from 'express'
import ScheduleController from '../../controllers/schedule'
import uploadConfig from 'src/configs/upload'
import multer from 'multer'
import isAuth from 'src/middlewares/isAuth'

const upload = multer(uploadConfig)
const schedulesRoutes = Router()
schedulesRoutes.use(isAuth)

schedulesRoutes.get('/agendamentos', ScheduleController.index)
schedulesRoutes.post('/agendamentos', ScheduleController.store)

schedulesRoutes.put('/agendamentos/:scheduleId', ScheduleController.update)
schedulesRoutes.get('/agendamentos/:scheduleId', ScheduleController.show)
schedulesRoutes.delete('/hararios/:scheduleId', ScheduleController.delete)

schedulesRoutes.post(
    '/agendamentos/:id/arquivos', 
    upload.array("file"),
    ScheduleController.mediaUpload
)
schedulesRoutes.delete('/agendamentos/:id/arquivos', ScheduleController.deleteMedia)

export default schedulesRoutes