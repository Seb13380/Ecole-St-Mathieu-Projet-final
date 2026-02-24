-- CreateTable
CREATE TABLE `InscriptionRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentFirstName` VARCHAR(191) NOT NULL,
    `parentLastName` VARCHAR(191) NOT NULL,
    `parentEmail` VARCHAR(191) NOT NULL,
    `parentPhone` VARCHAR(191) NOT NULL,
    `parentAddress` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `children` JSON NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` INTEGER NULL,
    `reviewComment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InscriptionRequest_parentEmail_key`(`parentEmail`),
    INDEX `InscriptionRequest_status_idx`(`status`),
    INDEX `InscriptionRequest_parentEmail_idx`(`parentEmail`),
    INDEX `InscriptionRequest_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InscriptionRequest` ADD CONSTRAINT `InscriptionRequest_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
