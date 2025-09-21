-- Migration sécurisée pour augmenter la taille du champ message
-- UNIQUEMENT pour le champ message de la table PreInscriptionRequest
-- AUCUNE suppression de données

ALTER TABLE `PreInscriptionRequest` 
MODIFY COLUMN `message` TEXT;

-- Vérification après modification
DESCRIBE `PreInscriptionRequest`;