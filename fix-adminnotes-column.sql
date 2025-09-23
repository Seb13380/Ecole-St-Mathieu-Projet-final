-- Script SQL sécurisé pour corriger la colonne adminNotes
-- À exécuter sur le VPS uniquement

-- 1. Sauvegarde de sécurité (optionnel mais recommandé)
-- CREATE TABLE PreInscriptionRequest_backup AS SELECT * FROM PreInscriptionRequest;

-- 2. Modification de la colonne adminNotes pour accepter des textes plus longs
ALTER TABLE PreInscriptionRequest 
MODIFY COLUMN adminNotes TEXT;

-- 3. Vérification
DESCRIBE PreInscriptionRequest;