-- CreateTable
CREATE TABLE `ParentInvitation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `parentEmail` VARCHAR(191) NOT NULL,
    `parentFirstName` VARCHAR(191) NOT NULL,
    `parentLastName` VARCHAR(191) NOT NULL,
    `childFirstName` VARCHAR(191) NOT NULL,
    `childLastName` VARCHAR(191) NOT NULL,
    `childDateNaissance` DATETIME(3) NULL,
    `classeId` INTEGER NULL,
    `emailSent` BOOLEAN NOT NULL DEFAULT false,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `ParentInvitation_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
