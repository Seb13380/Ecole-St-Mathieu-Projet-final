-- CreateTable
CREATE TABLE `ActualiteDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actualiteId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActualiteDocument_actualiteId_idx`(`actualiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActualiteDocument` ADD CONSTRAINT `ActualiteDocument_actualiteId_fkey` FOREIGN KEY (`actualiteId`) REFERENCES `Actualite`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
