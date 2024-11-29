import { Router } from 'express'
import isAuth from 'src/middlewares/isAuth'
import CampaignController from '../../controllers/campaign'
import multer from 'multer'
import uploadConfig from 'src/configs/upload'

const upload = multer(uploadConfig)
const CampaignRoutes = Router()

CampaignRoutes.get('/campanhas/lista', isAuth, CampaignController.findList)

CampaignRoutes.get('/campanhas', isAuth, CampaignController.index)

CampaignRoutes.get('/campanhas/:id', isAuth, CampaignController.show)

CampaignRoutes.post('/campanhas', isAuth, CampaignController.store)

CampaignRoutes.put('/campanhas/:id', isAuth, CampaignController.update)

CampaignRoutes.delete('/campanhas/:id', isAuth, CampaignController.delete)

CampaignRoutes.post('/campanhas/:id/cancelar', isAuth, CampaignController.cancel)

CampaignRoutes.post('/campanhas/:id/recarregar', isAuth, CampaignController.restart)

CampaignRoutes.post(
    '/campanhas/:id/arquivos', 
    isAuth, 
    upload.array("file"), 
    CampaignController.mediaUpload
)

CampaignRoutes.delete(
    '/campanhas/:id/arquivos', 
    isAuth, 
    CampaignController.deleteMedia
)

export default CampaignRoutes