-- Migration pour ajouter les champs external links aux documents
USE ecole_st_mathieu;

-- Ajouter les nouvelles colonnes au modèle Document
ALTER TABLE Document 
ADD COLUMN externalUrl VARCHAR(255) NULL,
ADD COLUMN isExternalLink BOOLEAN NOT NULL DEFAULT FALSE;
