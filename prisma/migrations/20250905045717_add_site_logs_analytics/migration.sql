/*
  Warnings:

  - You are about to drop the column `currentClass` on the `preinscriptionrequest` table. All the data in the column will be lost.
  - You are about to drop the column `previousSchool` on the `preinscriptionrequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestedClass` on the `preinscriptionrequest` table. All the data in the column will be lost.
  - You are about to drop the column `studentBirthDate` on the `preinscriptionrequest` table. All the data in the column will be lost.
  - You are about to drop the column `studentFirstName` on the `preinscriptionrequest` table. All the data in the column will be lost.
  - You are about to drop the column `studentLastName` on the `preinscriptionrequest` table. All the data in the column will be lost.
  - You are about to drop the `absence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `note` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `children` to the `PreInscriptionRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPassword` to the `PreInscriptionRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `absence` DROP FOREIGN KEY `Absence_classeId_fkey`;

-- DropForeignKey
ALTER TABLE `absence` DROP FOREIGN KEY `Absence_eleveId_fkey`;

-- DropForeignKey
ALTER TABLE `horaire` DROP FOREIGN KEY `Horaire_classeId_fkey`;

-- DropForeignKey
ALTER TABLE `horaire` DROP FOREIGN KEY `Horaire_enseignantId_fkey`;

-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_classeId_fkey`;

-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_eleveId_fkey`;

-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_enseignantId_fkey`;

-- AlterTable
ALTER TABLE `actualite` MODIFY `contenu` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `document` ADD COLUMN `externalUrl` VARCHAR(191) NULL,
    ADD COLUMN `isExternalLink` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `inscriptionrequest` ADD COLUMN `anneeScolaire` VARCHAR(191) NOT NULL DEFAULT '2025/2026';

-- AlterTable
ALTER TABLE `preinscriptionrequest` DROP COLUMN `currentClass`,
    DROP COLUMN `previousSchool`,
    DROP COLUMN `requestedClass`,
    DROP COLUMN `studentBirthDate`,
    DROP COLUMN `studentFirstName`,
    DROP COLUMN `studentLastName`,
    ADD COLUMN `anneeScolaire` VARCHAR(191) NOT NULL DEFAULT '2025/2026',
    ADD COLUMN `children` JSON NOT NULL,
    ADD COLUMN `parentPassword` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `absence`;

-- DropTable
DROP TABLE `horaire`;

-- DropTable
DROP TABLE `note`;

-- CreateTable
CREATE TABLE `CredentialsRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestedEmail` VARCHAR(191) NOT NULL,
    `requestedFirstName` VARCHAR(191) NOT NULL,
    `requestedLastName` VARCHAR(191) NOT NULL,
    `requestedPhone` VARCHAR(191) NULL,
    `foundParentId` INTEGER NULL,
    `foundParentEmail` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `processedAt` DATETIME(3) NULL,
    `processedBy` INTEGER NULL,
    `identifiersSent` BOOLEAN NOT NULL DEFAULT false,
    `errorMessage` VARCHAR(191) NULL,
    `adminNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CredentialsRequest_status_idx`(`status`),
    INDEX `CredentialsRequest_processed_idx`(`processed`),
    INDEX `CredentialsRequest_createdAt_idx`(`createdAt`),
    INDEX `CredentialsRequest_requestedEmail_idx`(`requestedEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgendaEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NULL,
    `heureDebut` VARCHAR(191) NULL,
    `heureFin` VARCHAR(191) NULL,
    `lieu` VARCHAR(191) NULL,
    `couleur` VARCHAR(191) NOT NULL DEFAULT '#3b82f6',
    `important` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `auteurId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AgendaEvent_dateDebut_idx`(`dateDebut`),
    INDEX `AgendaEvent_visible_idx`(`visible`),
    INDEX `AgendaEvent_important_idx`(`important`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InscriptionConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `soustitre` VARCHAR(191) NOT NULL DEFAULT 'Demande d''inscription pour l''année scolaire 2025-2026',
    `afficherAnnoncePS2026` BOOLEAN NOT NULL DEFAULT false,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `modifiePar` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InscriptionDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'FILE',
    `nomFichier` VARCHAR(191) NULL,
    `cheminFichier` VARCHAR(191) NULL,
    `taille` INTEGER NULL,
    `lienExterne` VARCHAR(191) NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ajoutePar` INTEGER NOT NULL,

    INDEX `InscriptionDocument_actif_idx`(`actif`),
    INDEX `InscriptionDocument_ordre_idx`(`ordre`),
    INDEX `InscriptionDocument_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InscriptionConfiguration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `soustitre` VARCHAR(191) NOT NULL DEFAULT 'Demande d''identifiants pour accéder à l''espace familles',
    `afficherAnnoncePS2026` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `method` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `route` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `userRole` VARCHAR(191) NULL,
    `userEmail` VARCHAR(191) NULL,
    `sessionId` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NOT NULL,
    `userAgent` TEXT NULL,
    `referer` VARCHAR(500) NULL,
    `responseTime` INTEGER NULL,
    `statusCode` INTEGER NULL,
    `action` VARCHAR(191) NULL,
    `resourceType` VARCHAR(191) NULL,
    `resourceId` INTEGER NULL,
    `searchQuery` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SiteLog_timestamp_idx`(`timestamp`),
    INDEX `SiteLog_userId_idx`(`userId`),
    INDEX `SiteLog_action_idx`(`action`),
    INDEX `SiteLog_route_idx`(`route`),
    INDEX `SiteLog_ip_idx`(`ip`),
    INDEX `SiteLog_statusCode_idx`(`statusCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CredentialsRequest` ADD CONSTRAINT `CredentialsRequest_foundParentId_fkey` FOREIGN KEY (`foundParentId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CredentialsRequest` ADD CONSTRAINT `CredentialsRequest_processedBy_fkey` FOREIGN KEY (`processedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgendaEvent` ADD CONSTRAINT `AgendaEvent_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InscriptionConfig` ADD CONSTRAINT `InscriptionConfig_modifiePar_fkey` FOREIGN KEY (`modifiePar`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InscriptionDocument` ADD CONSTRAINT `InscriptionDocument_ajoutePar_fkey` FOREIGN KEY (`ajoutePar`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteLog` ADD CONSTRAINT `SiteLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
