-- CreateTable
CREATE TABLE `Announcement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `priority` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `mediaPath` VARCHAR(191) NOT NULL,
    `mediaName` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Announcement_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Baileys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contacts` VARCHAR(191) NULL,
    `chats` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `whatsappId` INTEGER NOT NULL,

    INDEX `Baileys_whatsappId_idx`(`whatsappId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BaileysChats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jid` VARCHAR(191) NOT NULL,
    `conversationTimestamp` INTEGER NOT NULL,
    `unreadCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `whatsappId` INTEGER NOT NULL,

    INDEX `BaileysChats_whatsappId_idx`(`whatsappId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `message1` VARCHAR(191) NOT NULL DEFAULT '',
    `message2` VARCHAR(191) NOT NULL DEFAULT '',
    `message3` VARCHAR(191) NOT NULL DEFAULT '',
    `message4` VARCHAR(191) NOT NULL DEFAULT '',
    `message5` VARCHAR(191) NOT NULL DEFAULT '',
    `confirmationMessage1` VARCHAR(191) NOT NULL DEFAULT '',
    `confirmationMessage2` VARCHAR(191) NOT NULL DEFAULT '',
    `confirmationMessage3` VARCHAR(191) NOT NULL DEFAULT '',
    `confirmationMessage4` VARCHAR(191) NOT NULL DEFAULT '',
    `confirmationMessage5` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT 'INATIVA',
    `confirmation` BOOLEAN NOT NULL,
    `mediaPath` VARCHAR(191) NOT NULL,
    `mediaName` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `contactListId` INTEGER NOT NULL,
    `whatsappId` INTEGER NOT NULL,
    `fileListId` INTEGER NOT NULL,

    INDEX `Campaign_companyId_idx`(`companyId`),
    INDEX `Campaign_contactListId_idx`(`contactListId`),
    INDEX `Campaign_whatsappId_idx`(`whatsappId`),
    INDEX `Campaign_fileListId_idx`(`fileListId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `CampaignSetting_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignShipping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobId` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `confirmationMessage` VARCHAR(191) NOT NULL,
    `confirmation` BOOLEAN NOT NULL,
    `contactId` INTEGER NOT NULL,
    `campaignId` INTEGER NOT NULL,
    `confirmationRequestedAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CampaignShipping_contactId_idx`(`contactId`),
    INDEX `CampaignShipping_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `ownerId` INTEGER NOT NULL,
    `lastMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Chat_companyId_idx`(`companyId`),
    INDEX `Chat_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chatId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL DEFAULT '',
    `mediaPath` VARCHAR(191) NULL,
    `mediaName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChatMessage_chatId_idx`(`chatId`),
    INDEX `ChatMessage_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chatId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `unreads` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChatUser_chatId_idx`(`chatId`),
    INDEX `ChatUser_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `recurrence` VARCHAR(191) NOT NULL,
    `schedules` JSON NOT NULL,
    `planId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Company_planId_idx`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `profilePicUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `isGroup` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `whatsappId` INTEGER NULL,

    UNIQUE INDEX `Contact_number_key`(`number`),
    INDEX `Contact_companyId_idx`(`companyId`),
    INDEX `Contact_whatsappId_idx`(`whatsappId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactCustomField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `contactId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContactCustomField_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `ContactList_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactListItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `isWhatsappValid` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `contactListId` INTEGER NOT NULL,

    INDEX `ContactListItem_companyId_idx`(`companyId`),
    INDEX `ContactListItem_contactListId_idx`(`contactListId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `Files_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilesOptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `mediaType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fileId` INTEGER NOT NULL,

    INDEX `FilesOptions_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Help` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `video` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `detail` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `Invoice_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `remoteJid` VARCHAR(191) NOT NULL,
    `participant` VARCHAR(191) NOT NULL,
    `dataJson` VARCHAR(191) NOT NULL,
    `ack` INTEGER NOT NULL DEFAULT 0,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `fromMe` BOOLEAN NOT NULL DEFAULT false,
    `body` TEXT NOT NULL,
    `mediaUrl` VARCHAR(191) NULL,
    `mediaType` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,
    `quotedMsgId` VARCHAR(191) NULL,
    `ticketId` INTEGER NULL,
    `contactId` INTEGER NULL,
    `companyId` INTEGER NOT NULL,
    `queueId` INTEGER NULL,

    INDEX `Message_ticketId_idx`(`ticketId`),
    INDEX `Message_contactId_idx`(`contactId`),
    INDEX `Message_companyId_idx`(`companyId`),
    INDEX `Message_queueId_idx`(`queueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `users` INTEGER NULL,
    `connections` INTEGER NULL,
    `queues` INTEGER NULL,
    `value` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `useSchedules` BOOLEAN NOT NULL,
    `useCampaigns` BOOLEAN NOT NULL,
    `useInternalChat` BOOLEAN NOT NULL,
    `useExternalApi` BOOLEAN NOT NULL,
    `useKanban` BOOLEAN NOT NULL,
    `useOpenAi` BOOLEAN NOT NULL,
    `useIntegrations` BOOLEAN NOT NULL,

    UNIQUE INDEX `Plan_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prompt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `maxMessages` INTEGER NOT NULL DEFAULT 10,
    `maxTokens` INTEGER NOT NULL DEFAULT 100,
    `temperature` INTEGER NOT NULL DEFAULT 1,
    `promptTokens` INTEGER NOT NULL DEFAULT 0,
    `completionTokens` INTEGER NOT NULL DEFAULT 0,
    `totalTokens` INTEGER NOT NULL DEFAULT 0,
    `voice` VARCHAR(191) NOT NULL,
    `voiceKey` VARCHAR(191) NULL,
    `voiceRegion` VARCHAR(191) NULL,
    `queueId` INTEGER NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Prompt_queueId_key`(`queueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Queue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `greetingMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `outOfHoursMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `schedules` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `orderQueue` INTEGER NOT NULL,
    `integrationId` INTEGER NULL,
    `promptId` INTEGER NULL,

    UNIQUE INDEX `Queue_name_key`(`name`),
    UNIQUE INDEX `Queue_color_key`(`color`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QueueIntegrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` TEXT NOT NULL,
    `name` TEXT NOT NULL,
    `projectName` TEXT NOT NULL,
    `jsonContent` TEXT NOT NULL,
    `urlN8N` TEXT NOT NULL,
    `language` TEXT NOT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `typebotSlug` VARCHAR(191) NOT NULL,
    `typebotExpires` INTEGER NOT NULL DEFAULT 0,
    `typebotKeywordFinish` VARCHAR(191) NULL,
    `typebotUnknownMessage` VARCHAR(191) NULL,
    `typebotDelayMessage` INTEGER NOT NULL DEFAULT 1000,
    `typebotKeywordRestart` VARCHAR(191) NULL,
    `typebotRestartMessage` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QueueOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `option` VARCHAR(191) NULL,
    `queueId` INTEGER NOT NULL,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,

    INDEX `QueueOption_queueId_idx`(`queueId`),
    INDEX `QueueOption_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuickMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shortcode` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `mediaName` VARCHAR(191) NOT NULL,
    `mediaPath` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,

    INDEX `QuickMessage_companyId_idx`(`companyId`),
    INDEX `QuickMessage_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `body` TEXT NOT NULL,
    `sendAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL,
    `mediaPath` VARCHAR(191) NOT NULL,
    `mediaName` VARCHAR(191) NOT NULL,
    `contactId` INTEGER NOT NULL,
    `ticketId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,

    INDEX `Schedule_contactId_idx`(`contactId`),
    INDEX `Schedule_ticketId_idx`(`ticketId`),
    INDEX `Schedule_userId_idx`(`userId`),
    INDEX `Schedule_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `Setting_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isActive` BOOLEAN NOT NULL,
    `userPriceCents` INTEGER NULL,
    `whatsPriceCents` INTEGER NULL,
    `lastInvoiceUrl` VARCHAR(191) NULL,
    `lastPlanChange` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `providerSubscriptionId` VARCHAR(191) NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,

    INDEX `Subscription_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `kanban` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Tag_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `unreadMessages` INTEGER NULL,
    `lastMessage` VARCHAR(191) NULL,
    `isGroup` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `chatbot` BOOLEAN NULL,
    `typebotSessionId` VARCHAR(191) NULL,
    `typebotStatus` BOOLEAN NOT NULL DEFAULT false,
    `amountUsedBotQueues` INTEGER NOT NULL DEFAULT 0,
    `userId` INTEGER NOT NULL,
    `contactId` INTEGER NOT NULL,
    `whatsappId` INTEGER NOT NULL,
    `queueId` INTEGER NOT NULL,
    `queueOptionId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `integrationId` INTEGER NULL,
    `promptId` INTEGER NULL,
    `uuid` VARCHAR(191) NOT NULL,

    INDEX `Ticket_companyId_idx`(`companyId`),
    INDEX `Ticket_queueId_idx`(`queueId`),
    INDEX `Ticket_whatsappId_idx`(`whatsappId`),
    INDEX `Ticket_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `note` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `contactId` INTEGER NOT NULL,
    `ticketId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketTag` (
    `ticketId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ticketId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `whatsappId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rated` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `queuedAt` DATETIME(3) NOT NULL,
    `finishedAt` DATETIME(3) NOT NULL,
    `ratingAt` DATETIME(3) NOT NULL,
    `chatbotAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `tokenVersion` INTEGER NOT NULL DEFAULT 0,
    `profile` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `super` BOOLEAN NOT NULL,
    `online` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `whatsappId` INTEGER NOT NULL,
    `password` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserQueue` (
    `userId` INTEGER NOT NULL,
    `queueId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`, `queueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rate` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Whatsapp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `session` VARCHAR(191) NULL,
    `qrcode` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `battery` VARCHAR(191) NULL,
    `plugged` BOOLEAN NULL,
    `retries` INTEGER NULL,
    `greetingMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `farewellMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `complationMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `outOfHoursMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `ratingMessage` VARCHAR(191) NOT NULL DEFAULT '',
    `provider` VARCHAR(191) NOT NULL DEFAULT 'stable',
    `isDefault` BOOLEAN NULL DEFAULT false,
    `token` VARCHAR(191) NULL,
    `transferQueueId` INTEGER NULL,
    `timeToTransfer` INTEGER NULL,
    `maxUseBotQueues` INTEGER NULL,
    `timeUseBotQueues` VARCHAR(191) NULL,
    `expiresTicket` INTEGER NULL,
    `expiresInactiveMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `promptId` INTEGER NULL,

    UNIQUE INDEX `Whatsapp_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsappQueue` (
    `whatsappId` INTEGER NOT NULL,
    `queueId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`whatsappId`, `queueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_QueueCompany` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_QueueCompany_AB_unique`(`A`, `B`),
    INDEX `_QueueCompany_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_WhatsappQueues` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_WhatsappQueues_AB_unique`(`A`, `B`),
    INDEX `_WhatsappQueues_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserQueue` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserQueue_AB_unique`(`A`, `B`),
    INDEX `_UserQueue_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TicketTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TicketTag_AB_unique`(`A`, `B`),
    INDEX `_TicketTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baileys` ADD CONSTRAINT `Baileys_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BaileysChats` ADD CONSTRAINT `BaileysChats_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_contactListId_fkey` FOREIGN KEY (`contactListId`) REFERENCES `ContactList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_fileListId_fkey` FOREIGN KEY (`fileListId`) REFERENCES `Files`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignSetting` ADD CONSTRAINT `CampaignSetting_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignShipping` ADD CONSTRAINT `CampaignShipping_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `ContactListItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignShipping` ADD CONSTRAINT `CampaignShipping_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatUser` ADD CONSTRAINT `ChatUser_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatUser` ADD CONSTRAINT `ChatUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactCustomField` ADD CONSTRAINT `ContactCustomField_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactList` ADD CONSTRAINT `ContactList_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactListItem` ADD CONSTRAINT `ContactListItem_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactListItem` ADD CONSTRAINT `ContactListItem_contactListId_fkey` FOREIGN KEY (`contactListId`) REFERENCES `ContactList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Files` ADD CONSTRAINT `Files_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilesOptions` ADD CONSTRAINT `FilesOptions_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `Files`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_quotedMsgId_fkey` FOREIGN KEY (`quotedMsgId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Queue` ADD CONSTRAINT `Queue_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Queue` ADD CONSTRAINT `Queue_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `QueueIntegrations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QueueIntegrations` ADD CONSTRAINT `QueueIntegrations_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QueueOption` ADD CONSTRAINT `QueueOption_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QueueOption` ADD CONSTRAINT `QueueOption_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `QueueOption`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuickMessage` ADD CONSTRAINT `QuickMessage_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuickMessage` ADD CONSTRAINT `QuickMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Setting` ADD CONSTRAINT `Setting_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_queueOptionId_fkey` FOREIGN KEY (`queueOptionId`) REFERENCES `QueueOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `QueueIntegrations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_promptId_fkey` FOREIGN KEY (`promptId`) REFERENCES `Prompt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketNote` ADD CONSTRAINT `TicketNote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketNote` ADD CONSTRAINT `TicketNote_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketNote` ADD CONSTRAINT `TicketNote_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTag` ADD CONSTRAINT `TicketTag_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTag` ADD CONSTRAINT `TicketTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTracking` ADD CONSTRAINT `TicketTracking_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTracking` ADD CONSTRAINT `TicketTracking_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTracking` ADD CONSTRAINT `TicketTracking_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTracking` ADD CONSTRAINT `TicketTracking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQueue` ADD CONSTRAINT `UserQueue_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQueue` ADD CONSTRAINT `UserQueue_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRating` ADD CONSTRAINT `UserRating_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRating` ADD CONSTRAINT `UserRating_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRating` ADD CONSTRAINT `UserRating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Whatsapp` ADD CONSTRAINT `Whatsapp_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Whatsapp` ADD CONSTRAINT `Whatsapp_promptId_fkey` FOREIGN KEY (`promptId`) REFERENCES `Prompt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsappQueue` ADD CONSTRAINT `WhatsappQueue_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsappQueue` ADD CONSTRAINT `WhatsappQueue_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_QueueCompany` ADD CONSTRAINT `_QueueCompany_A_fkey` FOREIGN KEY (`A`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_QueueCompany` ADD CONSTRAINT `_QueueCompany_B_fkey` FOREIGN KEY (`B`) REFERENCES `Queue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WhatsappQueues` ADD CONSTRAINT `_WhatsappQueues_A_fkey` FOREIGN KEY (`A`) REFERENCES `Queue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_WhatsappQueues` ADD CONSTRAINT `_WhatsappQueues_B_fkey` FOREIGN KEY (`B`) REFERENCES `Whatsapp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserQueue` ADD CONSTRAINT `_UserQueue_A_fkey` FOREIGN KEY (`A`) REFERENCES `Queue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserQueue` ADD CONSTRAINT `_UserQueue_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TicketTag` ADD CONSTRAINT `_TicketTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TicketTag` ADD CONSTRAINT `_TicketTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
