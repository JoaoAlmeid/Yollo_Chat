import { Router } from 'express'
import userRoutes from './user'
import authRoutes from './auth'
import settingsRoutes from './settings'
import contactRoutes from './contact'
import ticketRoutes from './ticket'
import whatsappRoutes from './whatsapp'
import messageRoutes from './message'
import whatsappSessionRoutes from './whatsappSession'
import queuesRoutes from './queue'
import companyRoutes from './company'
import planRoutes from './plan'
import ticketNoteRoutes from './ticketNote'
import quickMessagesRoutes from './quickMessage/quickMessageRoutes'
import helpRoutes from './help'
import dashboardRoutes from './dashboard'
import queueOptionsRoutes from './queueOption'
import schedulesRoutes from './schedule'
import tagRoutes from './tag'
import contactListRoutes from './contactList'
import contactListItemRoutes from './contactListItem'
import CampaignRoutes from './campaign'
import CampaignSettingRoutes from './campaignSettings'
import announcementsRoutes from './announcement'
import chatRoutes from './chat'
import invoiceRoutes from './invoices'
import subscriptionRoutes from './subscription'
import ticketTagRoutes from './ticketTag'
import fileRoutes from './files'
import promptsRoutes from './prompt'
import queueIntegrationsRoutes from './queueIntegrations'
import logRouter from './log/logRoutes'

const routes = Router()

routes.use(userRoutes)
routes.use("auth", authRoutes)
routes.use(settingsRoutes)
routes.use(contactRoutes)
routes.use(ticketRoutes)
routes.use(whatsappRoutes)
routes.use(messageRoutes)
routes.use(whatsappSessionRoutes)
routes.use(queuesRoutes)
routes.use(companyRoutes)
routes.use(planRoutes)
routes.use(ticketNoteRoutes)
routes.use(quickMessagesRoutes)
routes.use(helpRoutes)
routes.use(dashboardRoutes)
routes.use(queueOptionsRoutes)
routes.use(schedulesRoutes)
routes.use(tagRoutes)
routes.use(contactListRoutes)
routes.use(contactListItemRoutes)
routes.use(CampaignRoutes)
routes.use(CampaignSettingRoutes)
routes.use(announcementsRoutes)
routes.use(chatRoutes)
routes.use(subscriptionRoutes)
routes.use(invoiceRoutes)
routes.use(ticketTagRoutes)
routes.use(fileRoutes)
routes.use(promptsRoutes)
routes.use(queueIntegrationsRoutes)
routes.use(logRouter)

export default routes