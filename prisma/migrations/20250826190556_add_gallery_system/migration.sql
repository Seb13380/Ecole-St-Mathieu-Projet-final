/*
  Warnings:

  - You are about to alter the column `status` on the `inscriptionrequest` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.
  - The values [MAINTENANCE_SITE] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropIndex
DROP INDEX `InscriptionRequest_createdAt_idx` ON `inscriptionrequest`;

-- DropIndex
DROP INDEX `InscriptionRequest_parentEmail_idx` ON `inscriptionrequest`;

-- DropIndex
DROP INDEX `InscriptionRequest_status_idx` ON `inscriptionrequest`;

-- AlterTable
ALTER TABLE `inscriptionrequest` ADD COLUMN `rejectionReason` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('PARENT', 'ENSEIGNANT', 'ADMIN', 'DIRECTION', 'ASSISTANT_DIRECTION', 'APEL', 'GESTIONNAIRE_SITE', 'SECRETAIRE_DIRECTION', 'RESTAURATION') NOT NULL DEFAULT 'PARENT';

-- CreateTable
CREATE TABLE `GalleryTheme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GalleryTheme_name_key`(`name`),
    INDEX `GalleryTheme_active_idx`(`active`),
    INDEX `GalleryTheme_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryMedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `originalUrl` VARCHAR(191) NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `titre` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `themeId` INTEGER NOT NULL,
    `auteurId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GalleryMedia_themeId_idx`(`themeId`),
    INDEX `GalleryMedia_auteurId_idx`(`auteurId`),
    INDEX `GalleryMedia_active_idx`(`active`),
    INDEX `GalleryMedia_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InscriptionRequest` ADD CONSTRAINT `InscriptionRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryMedia` ADD CONSTRAINT `GalleryMedia_themeId_fkey` FOREIGN KEY (`themeId`) REFERENCES `GalleryTheme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GalleryMedia` ADD CONSTRAINT `GalleryMedia_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
