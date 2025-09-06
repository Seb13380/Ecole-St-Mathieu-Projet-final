-- Migration pour ajouter le système de demandes d'identifiants au dashboard
USE ecole_st_mathieu;

-- Créer la table CredentialsRequest
CREATE TABLE CredentialsRequest (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requestedEmail VARCHAR(191) NOT NULL,
    requestedFirstName VARCHAR(191) NOT NULL,
    requestedLastName VARCHAR(191) NOT NULL,
    requestedPhone VARCHAR(191) NULL,
    
    foundParentId INT NULL,
    foundParentEmail VARCHAR(191) NULL,
    
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processedAt DATETIME NULL,
    processedBy INT NULL,
    
    identifiersSent BOOLEAN NOT NULL DEFAULT FALSE,
    errorMessage VARCHAR(500) NULL,
    adminNotes TEXT NULL,
    
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_processed (processed),
    INDEX idx_createdAt (createdAt),
    INDEX idx_requestedEmail (requestedEmail),
    
    FOREIGN KEY (foundParentId) REFERENCES User(id) ON DELETE SET NULL,
    FOREIGN KEY (processedBy) REFERENCES User(id) ON DELETE SET NULL
);

-- Vérifier la création de la table
DESCRIBE CredentialsRequest;

-- Message de confirmation
SELECT 'Migration CredentialsRequest terminée - Table créée avec succès' AS Status;
