/*
  Warnings:

  - A unique constraint covering the columns `[validationToken]` on the table `PreInscriptionRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `preinscriptionrequest` ADD COLUMN `emailValidated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `validationToken` VARCHAR(191) NULL,
    MODIFY `status` ENUM('EMAIL_PENDING', 'PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'EMAIL_PENDING';

-- CreateIndex
CREATE UNIQUE INDEX `PreInscriptionRequest_validationToken_key` ON `PreInscriptionRequest`(`validationToken`);

-- CreateIndex
CREATE INDEX `PreInscriptionRequest_emailValidated_idx` ON `PreInscriptionRequest`(`emailValidated`);

-- CreateIndex
CREATE INDEX `PreInscriptionRequest_validationToken_idx` ON `PreInscriptionRequest`(`validationToken`);
