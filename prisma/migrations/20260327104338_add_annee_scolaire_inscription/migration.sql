-- CreateTable
CREATE TABLE `AnneeScolaireInscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL DEFAULT '',
    `ouverte` BOOLEAN NOT NULL DEFAULT false,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AnneeScolaireInscription_libelle_key`(`libelle`),
    INDEX `AnneeScolaireInscription_ouverte_idx`(`ouverte`),
    INDEX `AnneeScolaireInscription_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed: insertion des trois années initiales
INSERT INTO `AnneeScolaireInscription` (`libelle`, `label`, `ouverte`, `ordre`, `updatedAt`) VALUES
  ('2025/2026', 'En cours', true, 1, NOW()),
  ('2026/2027', 'Prochaine', true, 2, NOW()),
  ('2027/2028', '', true, 3, NOW());
