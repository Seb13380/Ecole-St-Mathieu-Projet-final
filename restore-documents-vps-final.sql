-- Script de restauration des documents pour VPS (sans contrainte auteurId)
-- Base de données: st_mathieu

USE st_mathieu;

-- Supprimer les anciens documents s'ils existent
DELETE FROM Document;

-- Réinitialiser l'auto-increment
ALTER TABLE Document AUTO_INCREMENT = 1;

-- Trouver un utilisateur existant ou utiliser NULL
SET @auteur_id = (SELECT id FROM User LIMIT 1);

-- Insérer les documents avec un auteurId valide ou NULL
INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES
('PROJET_EDUCATIF', 'projet éducatif', NULL, NULL, '/uploads/documents/document-1756445000426-261237197.docx', 'Projet Educatif VALIDE 2024 Saint Mathieu.docx', true, 0, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('PROJET_ETABLISSEMENT', 'Projet d''établissement', NULL, NULL, NULL, NULL, true, 1, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('REGLEMENT_INTERIEUR', 'Règlement intérieur', NULL, NULL, '/uploads/documents/reglement-public.pdf', 'reglement-public.pdf', true, 2, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('REGLEMENT_INTERIEUR', 'Règlement intérieur (version complète)', NULL, NULL, NULL, NULL, false, 3, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('DOSSIER_INSCRIPTION', 'Dossier d''inscription', NULL, NULL, NULL, NULL, true, 4, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('ORGANIGRAMME', 'Organigramme de l''école', NULL, NULL, NULL, NULL, true, 5, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('ORGANIGRAMME', 'Organigramme complet', NULL, NULL, '/uploads/documents/organigramme-prive.pdf', 'organigramme-prive.pdf', false, 6, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('CHARTE_LAICITE', 'Charte de la laïcité', NULL, NULL, NULL, NULL, true, 7, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('CHARTE_NUMERIQUE', 'Charte numérique', NULL, NULL, NULL, NULL, true, 8, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20'),
('PASTORALE_AXE', 'Axe pastoral', NULL, NULL, NULL, NULL, true, 9, @auteur_id, '2025-08-27 07:48:08', '2025-08-29 05:23:20');

-- Vérifier l'insertion
SELECT COUNT(*) as 'Total documents' FROM Document;
SELECT COUNT(*) as 'Documents actifs' FROM Document WHERE active = true;

-- Afficher les documents
SELECT id, type, titre, active, pdfUrl, auteurId FROM Document ORDER BY ordre;

-- Afficher l'utilisateur utilisé comme auteur
SELECT 'Auteur utilisé:' as info, id, nom, prenom FROM User WHERE id = @auteur_id;
