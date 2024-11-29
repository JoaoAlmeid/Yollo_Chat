import { Router } from 'express'
import TagController from '../../controllers/tag'
import isAuth from 'src/middlewares/isAuth'

const tagRoutes = Router()
tagRoutes.use(isAuth)

tagRoutes.get('/tags', TagController.index)
tagRoutes.post('/tags', TagController.store)

tagRoutes.put('/tags/:tagId', TagController.update)
tagRoutes.get('/tags/:tagId', TagController.show)
tagRoutes.delete('/tags/:tagId', TagController.delete)

tagRoutes.get('/tags/lista', TagController.list)
tagRoutes.get('/tags/kanban', TagController.kanban)
tagRoutes.post('/tags/sync', TagController.syncTags)

export default tagRoutes