-- AlterTable
ALTER TABLE `actualite` ADD COLUMN `documentsUrls` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    MODIFY `contenu` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `menu` ADD COLUMN `imageUrls` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('PARENT', 'ENSEIGNANT', 'ADMIN', 'DIRECTION', 'MAINTENANCE_SITE', 'SECRETAIRE_DIRECTION', 'RESTAURATION', 'ASSISTANT_DIRECTION', 'APEL') NOT NULL DEFAULT 'PARENT';

-- CreateTable
CREATE TABLE `PreInscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `childFirstName` VARCHAR(191) NOT NULL,
    `childLastName` VARCHAR(191) NOT NULL,
    `childDateNaissance` DATETIME(3) NULL,
    `parentFirstName` VARCHAR(191) NOT NULL,
    `parentLastName` VARCHAR(191) NOT NULL,
    `parentEmail` VARCHAR(191) NOT NULL,
    `parentPhone` VARCHAR(191) NOT NULL,
    `parentAdress` VARCHAR(191) NOT NULL,
    `parentPassword` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `notificationSent` BOOLEAN NOT NULL DEFAULT false,
    `processedBy` INTEGER NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PreInscription_parentEmail_key`(`parentEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreInscription` ADD CONSTRAINT `PreInscription_processedBy_fkey` FOREIGN KEY (`processedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
