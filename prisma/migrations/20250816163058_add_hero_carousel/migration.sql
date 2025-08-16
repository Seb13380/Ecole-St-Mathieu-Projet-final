-- CreateTable
CREATE TABLE `HeroCarousel` (
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

    INDEX `HeroCarousel_active_idx`(`active`),
    INDEX `HeroCarousel_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HeroCarousel` ADD CONSTRAINT `HeroCarousel_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
