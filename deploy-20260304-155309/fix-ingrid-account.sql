-- =====================================================================
-- Script de correction : Compte parent Ingrid Lebourgeois
-- Email : ingrid.lebourgeois@gmail.com
-- Mot de passe temporaire : EcoleNicolas123!
-- AUCUNE DONNÉE N'EST SUPPRIMÉE
-- =====================================================================
-- À exécuter sur le serveur VPS via : mysql -u root -p stmathieu < fix-ingrid-account.sql

-- 1. Vérifier si le compte existe (informatif uniquement)
SELECT 
    id,
    firstName,
    lastName,
    email,
    role,
    IF(password IS NOT NULL AND password != '', 'Défini', 'ABSENT') AS mot_de_passe,
    createdAt
FROM User
WHERE email = 'ingrid.lebourgeois@gmail.com';

-- 2. Si le compte EXISTE : réinitialiser uniquement le mot de passe
--    (ne modifie pas le nom, prénom, rôle, ni aucune autre donnée)
UPDATE User
SET
    password = '$2b$10$R7Y1BxdIU55Jipix35IVB.Ferh1.TvOo829QG3LFmZwT8l8dr0UcC',
    updatedAt = NOW()
WHERE email = 'ingrid.lebourgeois@gmail.com';

-- Vérifier combien de lignes ont été modifiées :
-- Si ROW_COUNT() = 1 → compte trouvé et mis à jour ✅
-- Si ROW_COUNT() = 0 → compte non trouvé, exécuter le INSERT ci-dessous

-- 3. Si le compte N'EXISTE PAS : créer le compte (décommenter si nécessaire)
-- INSERT INTO User (firstName, lastName, email, password, role, createdAt, updatedAt)
-- SELECT 'Ingrid', 'Lebourgeois', 'ingrid.lebourgeois@gmail.com',
--        '$2b$10$R7Y1BxdIU55Jipix35IVB.Ferh1.TvOo829QG3LFmZwT8l8dr0UcC',
--        'PARENT', NOW(), NOW()
-- WHERE NOT EXISTS (
--     SELECT 1 FROM User WHERE email = 'ingrid.lebourgeois@gmail.com'
-- );

-- 4. Confirmation finale
SELECT 
    id,
    firstName,
    lastName,
    email,
    role,
    'Mis à jour ✅' AS statut,
    updatedAt
FROM User
WHERE email = 'ingrid.lebourgeois@gmail.com';

-- =====================================================================
-- Résumé :
--   Mot de passe temporaire déployé : EcoleNicolas123!
--   La maman doit utiliser ce mot de passe pour se connecter.
--   Conseiller de changer le mot de passe après la première connexion.
-- =====================================================================
