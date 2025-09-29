/*
  Warnings:

  - You are about to drop the column `dateDepot` on the `dossierinscription` table. All the data in the column will be lost.
  - You are about to drop the column `enfantDepartementNaissance` on the `dossierinscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_parentId_fkey`;

-- DropIndex
DROP INDEX `DossierInscription_dateDepot_idx` ON `dossierinscription`;

-- DropIndex
DROP INDEX `Student_parentId_fkey` ON `student`;

-- AlterTable
ALTER TABLE `credentialsrequest` MODIFY `adminNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `dossierinscription` DROP COLUMN `dateDepot`,
    DROP COLUMN `enfantDepartementNaissance`,
    ADD COLUMN `enfantClasseActuelle` VARCHAR(191) NULL,
    ADD COLUMN `enfantVilleEtablissement` VARCHAR(191) NULL,
    ADD COLUMN `informationsFamille` TEXT NULL,
    ADD COLUMN `nombreEnfantsFoyer` INTEGER NULL,
    ADD COLUMN `situationFamiliale` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `preinscriptionrequest` MODIFY `message` TEXT NULL,
    MODIFY `adminNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `student` MODIFY `parentId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ParentStudent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ParentStudent_parentId_studentId_key`(`parentId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `DossierInscription_createdAt_idx` ON `DossierInscription`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentStudent` ADD CONSTRAINT `ParentStudent_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentStudent` ADD CONSTRAINT `ParentStudent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
