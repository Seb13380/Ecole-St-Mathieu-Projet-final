-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_classeId_fkey`;

-- DropIndex
DROP INDEX `Student_classeId_fkey` ON `student`;

-- AlterTable
ALTER TABLE `student` MODIFY `classeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_classeId_fkey` FOREIGN KEY (`classeId`) REFERENCES `Classe`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
