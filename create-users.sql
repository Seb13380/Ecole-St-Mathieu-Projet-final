-- Script SQL pour créer tous les utilisateurs principaux
-- À exécuter directement sur la base de données si nécessaire

-- 1. Lionel Camboulives - Directeur
INSERT INTO User (firstName, lastName, email, password, phone, adress, role, createdAt, updatedAt) 
VALUES (
    'Lionel', 
    'Camboulives', 
    'lionel.camboulives@ecole-saint-mathieu.fr', 
    '$2b$10$HASH_PLACEHOLDER_DIRECTEUR', -- Remplacer par le hash du mot de passe 'Directeur2025!'
    '04.91.12.34.56', 
    'École Saint-Mathieu', 
    'DIRECTION', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE 
    role = 'DIRECTION',
    firstName = 'Lionel',
    lastName = 'Camboulives',
    updatedAt = NOW();

-- 2. Frank - Maintenance du site  
INSERT INTO User (firstName, lastName, email, password, phone, adress, role, createdAt, updatedAt) 
VALUES (
    'Frank', 
    'Maintenance', 
    'frank@ecole-saint-mathieu.fr', 
    '$2b$10$HASH_PLACEHOLDER_FRANK', -- Remplacer par le hash du mot de passe 'Frank2025!'
    '04.91.23.45.67', 
    'École Saint-Mathieu', 
    'MAINTENANCE_SITE', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE 
    role = 'MAINTENANCE_SITE',
    firstName = 'Frank',
    lastName = 'Maintenance',
    updatedAt = NOW();

-- 3. Yamina - Assistante de direction
INSERT INTO User (firstName, lastName, email, password, phone, adress, role, createdAt, updatedAt) 
VALUES (
    'Yamina', 
    'Assistante', 
    'yamina@ecole-saint-mathieu.fr', 
    '$2b$10$HASH_PLACEHOLDER_YAMINA', -- Remplacer par le hash du mot de passe 'Yamina2025!'
    '04.91.34.56.78', 
    'École Saint-Mathieu', 
    'ASSISTANT_DIRECTION', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE 
    role = 'ASSISTANT_DIRECTION',
    firstName = 'Yamina',
    lastName = 'Assistante',
    updatedAt = NOW();

-- 4. Sébastien Giordano - Administrateur
INSERT INTO User (firstName, lastName, email, password, phone, adress, role, createdAt, updatedAt) 
VALUES (
    'Sébastien', 
    'Giordano', 
    'sebastien.giordano@ecole-saint-mathieu.fr', 
    '$2b$10$HASH_PLACEHOLDER_SEBASTIEN', -- Remplacer par le hash du mot de passe 'Admin2025!'
    '04.91.45.67.89', 
    'École Saint-Mathieu', 
    'ADMIN', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE 
    role = 'ADMIN',
    firstName = 'Sébastien',
    lastName = 'Giordano',
    updatedAt = NOW();

-- 5. Cécile - Contrôle restauration
INSERT INTO User (firstName, lastName, email, password, phone, adress, role, createdAt, updatedAt) 
VALUES (
    'Cécile', 
    'Restauration', 
    'cecile@ecole-saint-mathieu.fr', 
    '$2b$10$HASH_PLACEHOLDER_CECILE', -- Remplacer par le hash du mot de passe 'Cecile2025!'
    '04.91.56.78.90', 
    'École Saint-Mathieu', 
    'ADMIN', 
    NOW(), 
    NOW()
) ON DUPLICATE KEY UPDATE 
    role = 'ADMIN',
    firstName = 'Cécile',
    lastName = 'Restauration',
    updatedAt = NOW();

-- Vérification des utilisateurs créés
SELECT id, firstName, lastName, email, role, createdAt 
FROM User 
WHERE email IN (
    'lionel.camboulives@ecole-saint-mathieu.fr',
    'frank@ecole-saint-mathieu.fr', 
    'yamina@ecole-saint-mathieu.fr',
    'sebastien.giordano@ecole-saint-mathieu.fr',
    'cecile@ecole-saint-mathieu.fr'
)
ORDER BY role, firstName;

/*
NOTES IMPORTANTES :
- Remplacez les HASH_PLACEHOLDER par les vrais hashs bcrypt des mots de passe
- Mots de passe temporaires :
  * Lionel: Directeur2025!
  * Frank: Frank2025!
  * Yamina: Yamina2025!
  * Sébastien: Admin2025!
  * Cécile: Cecile2025!
  
- Rôles et permissions :
  * DIRECTION: Accès complet + gestion invitations parents
  * MAINTENANCE_SITE: Maintenance technique
  * ASSISTANT_DIRECTION: Assistance administrative  
  * ADMIN: Administration complète du système
  * ADMIN (Cécile): Gestion élèves et restauration
*/
