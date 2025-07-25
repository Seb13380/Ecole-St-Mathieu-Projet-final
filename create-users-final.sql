-- Script SQL prêt à exécuter avec les vrais hashs de mots de passe
-- École Saint-Mathieu - Création des utilisateurs principaux

-- 1. Lionel Camboulives - Directeur
INSERT INTO User (firstName, lastName, email, password, phone, adress, role, createdAt, updatedAt) 
VALUES (
    'Lionel', 
    'Camboulives', 
    'lionel.camboulives@ecole-saint-mathieu.fr', 
    '$2b$10$9knNCtpa/5BPL5jsbFiEiuNEbIciB8dwG00JwfMMWcsP9D4WSkGMm', -- Directeur2025!
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
    '$2b$10$BBZ5IA6z1XEBM.k2eYfl8uyQUI3q.5moTEyhqGsOMAiMH3nl8Vbd2', -- Frank2025!
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
    '$2b$10$GlzBr0c5VKxsAirHNHGm4.pgEzRzPirLs8KldAvnpQFSB0JI9PmNO', -- Yamina2025!
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
    '$2b$10$Tqu9pdskrcD1zII81kxmC.JONMVXVzSGs9sGF34cRBfNqQ4IZ82JS', -- Admin2025!
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
    '$2b$10$Cw4mzctgfqIYldUIjX2nYOMfONNB3DG3qQwD3O0e9yDK3BfX5IX56', -- Cecile2025!
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
SELECT 
    id, 
    firstName, 
    lastName, 
    email, 
    role, 
    DATE_FORMAT(createdAt, '%d/%m/%Y %H:%i') as dateCreation
FROM User 
WHERE email IN (
    'lionel.camboulives@ecole-saint-mathieu.fr',
    'frank@ecole-saint-mathieu.fr', 
    'yamina@ecole-saint-mathieu.fr',
    'sebastien.giordano@ecole-saint-mathieu.fr',
    'cecile@ecole-saint-mathieu.fr'
)
ORDER BY role, firstName;

-- Affichage du récapitulatif
SELECT 
    '🎉 RÉCAPITULATIF DES COMPTES CRÉÉS' as message;
    
SELECT 
    CONCAT('👑 ', firstName, ' ', lastName, ' (', role, '): ', email) as compte_info
FROM User 
WHERE email = 'lionel.camboulives@ecole-saint-mathieu.fr'
UNION ALL
SELECT 
    CONCAT('🔧 ', firstName, ' ', lastName, ' (', role, '): ', email) as compte_info
FROM User 
WHERE email = 'frank@ecole-saint-mathieu.fr'
UNION ALL
SELECT 
    CONCAT('👩‍💼 ', firstName, ' ', lastName, ' (', role, '): ', email) as compte_info
FROM User 
WHERE email = 'yamina@ecole-saint-mathieu.fr'
UNION ALL
SELECT 
    CONCAT('👨‍💻 ', firstName, ' ', lastName, ' (', role, '): ', email) as compte_info
FROM User 
WHERE email = 'sebastien.giordano@ecole-saint-mathieu.fr'
UNION ALL
SELECT 
    CONCAT('🍽️ ', firstName, ' ', lastName, ' (', role, '): ', email) as compte_info
FROM User 
WHERE email = 'cecile@ecole-saint-mathieu.fr';

/*
MOTS DE PASSE TEMPORAIRES :
👑 Lionel Camboulives: Directeur2025!
🔧 Frank: Frank2025!
👩‍💼 Yamina: Yamina2025!
👨‍💻 Sébastien Giordano: Admin2025!
🍽️ Cécile: Cecile2025!

⚠️ IMPORTANT: Changez ces mots de passe lors de la première connexion !

PERMISSIONS ET ACCÈS :
• Lionel: Accès complet direction + gestion invitations parents
• Frank: Maintenance technique du site
• Yamina: Assistance administrative
• Sébastien: Administration complète du système
• Cécile: Gestion élèves et tickets de restauration
*/
