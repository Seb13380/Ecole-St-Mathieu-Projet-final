-- Script de restauration des documents pour VPS
-- Généré le 01/09/2025 à 18:50:37

-- Supprimer les documents existants (optionnel)
-- DELETE FROM Document;

-- Insérer les documents

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('PROJET_EDUCATIF', 'projet éducatif', NULL, NULL, '/uploads/documents/document-1756445000426-261237197.docx', 'Projet Educatif VALIDE 2024 Saint Mathieu.docx', true, 0, 6, '2025-08-27T07:48:08.617Z', '2025-08-29T05:23:20.438Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('PROJET_ETABLISSEMENT', 'Projet d''établissement', 'Le projet d''établissement définit les orientations pédagogiques et éducatives de l''école Saint-Mathieu.', '<h1>Projet d''établissement</h1><p>Contenu à compléter...</p>', NULL, NULL, true, 0, 6, '2025-08-27T07:37:47.150Z', '2025-08-27T07:37:47.150Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('REGLEMENT_INTERIEUR', 'Règlement Intérieur de l''École', 'Les règles de vie et de fonctionnement de notre établissement.', '<h1>Règlement Intérieur</h1><p>Ce document présente les règles essentielles de notre établissement.</p>', NULL, NULL, true, 0, 7, '2025-08-27T07:05:26.512Z', '2025-08-27T07:05:26.512Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('REGLEMENT_INTERIEUR', 'Règlement intérieur avec PDF public', 'Ce document est accessible à tous', 'Contenu du règlement intérieur...', '/uploads/documents/reglement-public.pdf', 'reglement-public.pdf', true, 0, 7, '2025-08-29T05:13:41.889Z', '2025-08-29T05:13:41.889Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('DOSSIER_INSCRIPTION', 'Dossier d''inscription 2025-2026', 'Formulaires et documents nécessaires pour l''inscription de votre enfant à l''École Saint-Mathieu.', '
                    <h1>Dossier d''inscription - École Saint-Mathieu</h1>
                    
                    <h2>Documents à fournir :</h2>
                    <ul>
                        <li>Formulaire d''inscription complété</li>
                        <li>Copie du livret de famille</li>
                        <li>Certificat de scolarité de l''année en cours</li>
                        <li>2 photos d''identité récentes</li>
                        <li>Certificat médical</li>
                        <li>Attestation d''assurance scolaire</li>
                    </ul>
                    
                    <h2>Processus d''inscription :</h2>
                    <ol>
                        <li>Compléter le dossier d''inscription</li>
                        <li>Prendre rendez-vous avec la direction</li>
                        <li>Entretien avec l''enfant et les parents</li>
                        <li>Confirmation de l''inscription</li>
                    </ol>
                    
                    <h2>Contact :</h2>
                    <p>Pour toute question concernant l''inscription, contactez le secrétariat de l''école.</p>
                ', NULL, NULL, true, 0, 7, '2025-08-29T04:56:49.982Z', '2025-08-29T04:56:49.982Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('ORGANIGRAMME', 'Organigramme de l''école', 'Structure organisationnelle et hiérarchique de l''école Saint-Mathieu.', '<h1>Organigramme</h1><p>Structure à compléter...</p>', NULL, NULL, true, 0, 6, '2025-08-27T07:37:47.168Z', '2025-08-27T07:37:47.168Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('ORGANIGRAMME', 'Organigramme avec PDF privé', 'Ce document nécessite une connexion', 'Contenu de l''organigramme...', '/uploads/documents/organigramme-prive.pdf', 'organigramme-prive.pdf', true, 0, 7, '2025-08-29T05:13:41.900Z', '2025-08-29T05:13:41.900Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('CHARTE_LAICITE', 'Charte de la Laïcité', 'Nos principes de respect et de vivre-ensemble.', '<h1>Charte de la Laïcité</h1><p>La laïcité est un principe fondamental de notre République.</p>', NULL, NULL, true, 0, 7, '2025-08-27T07:05:26.520Z', '2025-08-27T07:05:26.520Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('CHARTE_NUMERIQUE', 'Charte du numérique', 'Règles d''usage des outils numériques à l''école.', '<h1>Charte du numérique</h1><p>Règles à définir...</p>', NULL, NULL, true, 0, 6, '2025-08-27T07:37:47.176Z', '2025-08-27T07:37:47.176Z');

INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('PASTORALE_AXE', 'Axe Pastoral de l''École', 'L''orientation spirituelle et humaine de notre établissement catholique.', '<h1>Axe Pastoral</h1><p>Notre école s''appuie sur les valeurs chrétiennes d''amour et de partage.</p>', NULL, NULL, true, 0, 7, '2025-08-27T07:05:26.526Z', '2025-08-27T08:12:29.352Z');
