-- Migration manuelle pour ajouter les champs externalUrl et isExternalLink
-- à la table Document

USE ecole_st_mathieu;

-- Ajouter la colonne externalUrl (VARCHAR pour stocker les URLs)
ALTER TABLE Document 
ADD COLUMN externalUrl VARCHAR(500) NULL AFTER pdfFilename;

-- Ajouter la colonne isExternalLink (BOOLEAN avec valeur par défaut FALSE)
ALTER TABLE Document 
ADD COLUMN isExternalLink BOOLEAN NOT NULL DEFAULT FALSE AFTER externalUrl;

-- Vérifier les colonnes ajoutées
DESCRIBE Document;

-- Afficher un message de confirmation
SELECT 'Migration terminée - Colonnes externalUrl et isExternalLink ajoutées' AS Status;
