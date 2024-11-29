/*
  Warnings:

  - You are about to drop the column `schedules` on the `company` table. All the data in the column will be lost.
  - You are about to alter the column `dueDate` on the `company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactId,campaignId]` on the table `CampaignShipping` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `QueueIntegrations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,key]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `campaign` DROP FOREIGN KEY `Campaign_contactListId_fkey`;

-- DropForeignKey
ALTER TABLE `campaign` DROP FOREIGN KEY `Campaign_whatsappId_fkey`;

-- DropForeignKey
ALTER TABLE `tickettracking` DROP FOREIGN KEY `TicketTracking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tickettracking` DROP FOREIGN KEY `TicketTracking_whatsappId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_whatsappId_fkey`;

-- AlterTable
ALTER TABLE `announcement` MODIFY `mediaPath` VARCHAR(191) NULL,
    MODIFY `mediaName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `campaign` MODIFY `contactListId` INTEGER NULL,
    MODIFY `whatsappId` INTEGER NULL;

-- AlterTable
ALTER TABLE `company` DROP COLUMN `schedules`,
    MODIFY `dueDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `queueintegrations` MODIFY `type` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `projectName` VARCHAR(191) NOT NULL,
    MODIFY `jsonContent` VARCHAR(191) NULL,
    MODIFY `urlN8N` VARCHAR(191) NULL,
    MODIFY `language` VARCHAR(191) NULL,
    MODIFY `typebotSlug` VARCHAR(191) NULL,
    MODIFY `typebotExpires` INTEGER NULL,
    MODIFY `typebotDelayMessage` INTEGER NULL;

-- AlterTable
ALTER TABLE `quickmessage` MODIFY `mediaName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `fromMe` BOOLEAN NULL,
    ADD COLUMN `isBot` BOOLEAN NULL,
    ADD COLUMN `useIntegration` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `tickettracking` ADD COLUMN `closedAt` DATETIME(3) NULL,
    MODIFY `whatsappId` INTEGER NULL,
    MODIFY `userId` INTEGER NULL,
    MODIFY `finishedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `password`,
    MODIFY `whatsappId` INTEGER NULL;

-- AlterTable
ALTER TABLE `whatsapp` ADD COLUMN `integrationId` INTEGER NULL,
    ADD COLUMN `sendIdQueue` INTEGER NULL,
    ADD COLUMN `timeSendQueue` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CampaignShipping_contactId_campaignId_key` ON `CampaignShipping`(`contactId`, `campaignId`);

-- CreateIndex
CREATE UNIQUE INDEX `QueueIntegrations_name_companyId_key` ON `QueueIntegrations`(`name`, `companyId`);

-- CreateIndex
CREATE UNIQUE INDEX `Setting_companyId_key_key` ON `Setting`(`companyId`, `key`);

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_contactListId_fkey` FOREIGN KEY (`contactListId`) REFERENCES `ContactList`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTracking` ADD CONSTRAINT `TicketTracking_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketTracking` ADD CONSTRAINT `TicketTracking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_whatsappId_fkey` FOREIGN KEY (`whatsappId`) REFERENCES `Whatsapp`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
