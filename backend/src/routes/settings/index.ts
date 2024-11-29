import { Router } from 'express'
import SettingController from 'src/controllers/settings'
import isAuth from 'src/middlewares/isAuth'

const settingsRoutes = Router()
settingsRoutes.use(isAuth)

settingsRoutes.get('/configuracao', SettingController.index)
settingsRoutes.put('/configuracao/:settingKey', SettingController.update)

export default settingsRoutes