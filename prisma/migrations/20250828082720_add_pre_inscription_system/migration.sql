-- CreateTable
CREATE TABLE `PreInscriptionRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentFirstName` VARCHAR(191) NOT NULL,
    `parentLastName` VARCHAR(191) NOT NULL,
    `parentEmail` VARCHAR(191) NOT NULL,
    `parentPhone` VARCHAR(191) NOT NULL,
    `parentAddress` VARCHAR(191) NULL,
    `studentFirstName` VARCHAR(191) NOT NULL,
    `studentLastName` VARCHAR(191) NOT NULL,
    `studentBirthDate` DATETIME(3) NOT NULL,
    `currentClass` VARCHAR(191) NULL,
    `requestedClass` VARCHAR(191) NOT NULL,
    `previousSchool` VARCHAR(191) NULL,
    `specialNeeds` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `processedBy` INTEGER NULL,
    `adminNotes` VARCHAR(191) NULL,

    INDEX `PreInscriptionRequest_status_idx`(`status`),
    INDEX `PreInscriptionRequest_submittedAt_idx`(`submittedAt`),
    INDEX `PreInscriptionRequest_parentEmail_idx`(`parentEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreInscriptionRequest` ADD CONSTRAINT `PreInscriptionRequest_processedBy_fkey` FOREIGN KEY (`processedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
