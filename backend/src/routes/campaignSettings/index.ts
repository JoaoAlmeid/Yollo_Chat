import { Router } from 'express'
import campaignSettingController from '../../controllers/campaignSetting'
import isAuth from 'src/middlewares/isAuth'

const CampaignSettingRoutes = Router()

CampaignSettingRoutes.get('/campanhas/config', isAuth, campaignSettingController.index)

CampaignSettingRoutes.post('/campanhas/config', isAuth, campaignSettingController.store)

export default CampaignSettingRoutes