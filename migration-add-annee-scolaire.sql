-- Migration pour ajouter le champ anneeScolaire aux demandes d'inscription
USE ecole_st_mathieu;

-- Ajouter la colonne anneeScolaire à InscriptionRequest
ALTER TABLE InscriptionRequest 
ADD COLUMN anneeScolaire VARCHAR(20) NOT NULL DEFAULT '2025/2026' AFTER children;

-- Ajouter la colonne anneeScolaire à PreInscriptionRequest  
ALTER TABLE PreInscriptionRequest 
ADD COLUMN anneeScolaire VARCHAR(20) NOT NULL DEFAULT '2025/2026' AFTER parentPassword;

-- Vérifier les structures mises à jour
DESCRIBE InscriptionRequest;
DESCRIBE PreInscriptionRequest;

-- Message de confirmation
SELECT 'Migration anneeScolaire terminée - Colonnes ajoutées aux deux tables d\'inscription' AS Status;
