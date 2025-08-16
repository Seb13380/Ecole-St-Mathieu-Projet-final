/*
  Warnings:

  - You are about to drop the column `documentsUrls` on the `actualite` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `actualite` table. All the data in the column will be lost.
  - You are about to drop the `preinscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `preinscription` DROP FOREIGN KEY `PreInscription_processedBy_fkey`;

-- AlterTable
ALTER TABLE `actualite` DROP COLUMN `documentsUrls`,
    DROP COLUMN `imageUrl`,
    MODIFY `contenu` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('PARENT', 'ENSEIGNANT', 'ADMIN', 'DIRECTION', 'ASSISTANT_DIRECTION', 'APEL', 'MAINTENANCE_SITE', 'SECRETAIRE_DIRECTION', 'RESTAURATION') NOT NULL DEFAULT 'PARENT';

-- DropTable
DROP TABLE `preinscription`;

-- CreateTable
CREATE TABLE `Travaux` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `auteurId` INTEGER NOT NULL,
    `dateDebut` DATETIME(3) NULL,
    `dateFin` DATETIME(3) NULL,
    `progression` INTEGER NOT NULL DEFAULT 0,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'PLANIFIE',
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `important` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CarouselImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `originalUrl` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `auteurId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CarouselImage_active_idx`(`active`),
    INDEX `CarouselImage_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Travaux` ADD CONSTRAINT `Travaux_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CarouselImage` ADD CONSTRAINT `CarouselImage_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
