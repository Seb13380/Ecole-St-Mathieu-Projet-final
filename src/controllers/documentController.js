const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Pages publiques pour les documents
const getDocumentsByCategory = async (req, res) => {
    try {
        const { category } = req.params; // 'ecole' ou 'pastorale'


        let documentTypes = [];
        let pageTitle = '';

        if (category === 'ecole') {
            documentTypes = [
                'PROJET_EDUCATIF',
                'PROJET_ETABLISSEMENT',
                'REGLEMENT_INTERIEUR',
                'ORGANIGRAMME',
                'CHARTE_LAICITE',
                'CHARTE_NUMERIQUE',
                'CHARTE_VIE_SCOLAIRE',
                'CHARTE_RESTAURATION'
            ];
            pageTitle = 'Documents de l\'École';
        } else if (category === 'pastorale') {
            documentTypes = [
                'PASTORALE_AXE',
                'PASTORALE_TEMPS_PRIANT',
                'PASTORALE_ENSEMBLE'
            ];
            pageTitle = 'Documents Pastorale';
        } else {
            return res.status(404).render('errors/404.twig');
        }

        const documents = await prisma.document.findMany({
            where: {
                type: { in: documentTypes },
                active: true
            },
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: [
                { type: 'asc' },
                { updatedAt: 'desc' }
            ]
        });


        // Grouper par type
        const documentsByType = {};
        documents.forEach(doc => {
            if (!documentsByType[doc.type]) {
                documentsByType[doc.type] = [];
            }
            documentsByType[doc.type].push(doc);
        });

        res.render('pages/documents/category.twig', {
            category,
            pageTitle,
            documentsByType,
            documents,
            isAuthenticated: !!req.session.user,
            user: req.session.user || null
        });

    } catch (error) {
        console.error('[getDocumentsByCategory] Erreur:', error);
        res.status(500).render('errors/500.twig', { error: error.message });
    }
};

const showDocument = async (req, res) => {
    try {
        const { id } = req.params;


        const document = await prisma.document.findUnique({
            where: {
                id: parseInt(id),
                active: true
            },
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!document) {
            return res.status(404).render('errors/404.twig');
        }


        res.render('pages/documents/show.twig', {
            document
        });

    } catch (error) {
        console.error('[showDocument] Erreur:', error);
        res.status(500).render('errors/500.twig', { error: error.message });
    }
};

const documentController = {
    // Afficher la liste des documents d'un type donné
    async showDocuments(req, res) {
        try {
            const { type } = req.params;

            const documents = await prisma.document.findMany({
                where: {
                    type: type.toUpperCase(),
                    active: true
                },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: { ordre: 'asc' }
            });

            // Définir les titres et descriptions selon le type
            const typeInfo = {
                'PROJET_EDUCATIF': {
                    title: 'Projet Éducatif',
                    description: 'Notre projet éducatif définit les orientations pédagogiques de l\'école'
                },
                'PROJET_ETABLISSEMENT': {
                    title: 'Projet d\'Établissement',
                    description: 'Le projet d\'établissement présente les objectifs et actions concrètes'
                },
                'REGLEMENT_INTERIEUR': {
                    title: 'Règlement Intérieur',
                    description: 'Le règlement intérieur définit les règles de vie de l\'école'
                },
                'ORGANIGRAMME': {
                    title: 'Organigramme',
                    description: 'L\'organisation et la structure de l\'équipe éducative'
                },
                'CHARTE_LAICITE': {
                    title: 'Charte de la Laïcité',
                    description: 'Les principes de laïcité appliqués dans notre établissement'
                },
                'CHARTE_NUMERIQUE': {
                    title: 'Charte du Numérique',
                    description: 'Règles d\'usage des outils numériques à l\'école'
                },
                'CHARTE_VIE_SCOLAIRE': {
                    title: 'Charte de Vie Scolaire',
                    description: 'Les règles de vie et de respect au sein de l\'école'
                },
                'CHARTE_RESTAURATION': {
                    title: 'Charte de Restauration',
                    description: 'Organisation et règles du service de restauration'
                },
                'AGENDA': {
                    title: 'Agenda',
                    description: 'Calendrier des événements et activités de l\'école'
                },
                'PASTORALE_AXE': {
                    title: 'Axe Pastoral de l\'École',
                    description: 'L\'orientation pastorale et spirituelle de notre établissement'
                },
                'PASTORALE_TEMPS_PRIANT': {
                    title: 'Temps Priant de l\'École',
                    description: 'Inscription et organisation des temps de prière'
                },
                'PASTORALE_ENSEMBLE': {
                    title: 'Ensemble Pastoral de l\'Étoile',
                    description: 'Notre participation à l\'ensemble pastoral local'
                }
            };

            const info = typeInfo[type.toUpperCase()] || {
                title: 'Documents',
                description: 'Documents de l\'école'
            };

            res.render('pages/documents/show.twig', {
                documents,
                type: type.toUpperCase(),
                title: info.title,
                description: info.description,
                user: req.session.user
            });

        } catch (error) {
            console.error('Erreur lors de l\'affichage des documents:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement des documents'
            });
        }
    },

    // Interface de gestion des documents (pour Lionel et Frank)
    async manageDocuments(req, res) {
        try {

            // Récupérer tous les documents groupés par type
            const documents = await prisma.document.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: [
                    { type: 'asc' },
                    { ordre: 'asc' }
                ]
            });


            // Grouper par type
            const documentsByType = {};
            documents.forEach(doc => {
                if (!documentsByType[doc.type]) {
                    documentsByType[doc.type] = [];
                }
                documentsByType[doc.type].push(doc);
            });


            res.render('pages/documents/manage.twig', {
                documentsByType,
                title: 'Gestion des Documents',
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

        } catch (error) {
            console.error('❌ Erreur lors de la gestion des documents:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement de la gestion des documents'
            });
        }
    },

    // Méthode de test pour diagnostiquer
    async testManage(req, res) {
        try {

            const documents = await prisma.document.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                }
            });


            const documentsByType = {};
            documents.forEach(doc => {
                if (!documentsByType[doc.type]) {
                    documentsByType[doc.type] = [];
                }
                documentsByType[doc.type].push(doc);
            });

            res.render('pages/documents/test.twig', {
                documentsByType,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

        } catch (error) {
            console.error('❌ Erreur lors du test:', error);
            res.status(500).send('Erreur de test: ' + error.message);
        }
    },

    // Créer un nouveau document
    async createDocument(req, res) {
        try {
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
                size: req.file.size
            } : 'Aucun fichier');

            const { type, titre, description, contenu, externalUrl, isExternalLink } = req.body;
            const auteurId = req.session.user.id;

            // Gestion du fichier PDF si présent
            let pdfUrl = null;
            let pdfFilename = null;
            if (req.file) {
                pdfUrl = `/uploads/documents/${req.file.filename}`;
                pdfFilename = req.file.originalname;
            }

            // Validation : soit un fichier PDF soit un lien externe
            if (!pdfUrl && !externalUrl) {
                return res.redirect('/documents/admin?error=' + encodeURIComponent('Veuillez fournir soit un fichier PDF soit un lien externe'));
            }

            const document = await prisma.document.create({
                data: {
                    type: type.toUpperCase(),
                    titre,
                    description,
                    contenu,
                    pdfUrl,
                    pdfFilename,
                    externalUrl: externalUrl || null,
                    isExternalLink: isExternalLink === 'true',
                    auteurId,
                    active: true
                }
            });

            res.redirect('/documents/admin?success=' + encodeURIComponent('Document créé avec succès'));

        } catch (error) {
            console.error('❌ ===== ERREUR CRÉATION DOCUMENT =====');
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            console.error('Données req.body:', req.body);
            console.error('Fichier req.file:', req.file);
            console.error('========================================');

            res.redirect('/documents/admin?error=' + encodeURIComponent('Erreur lors de la création du document: ' + error.message));
        }
    },

    // Mettre à jour un document
    async updateDocument(req, res) {
        try {
            const { id } = req.params;
            const { titre, description, contenu, externalUrl, isExternalLink } = req.body;

            const updateData = {
                titre,
                description,
                contenu,
                externalUrl: externalUrl || null,
                isExternalLink: isExternalLink === 'true'
            };

            // Gestion du nouveau fichier PDF si présent
            if (req.file) {
                updateData.pdfUrl = `/uploads/documents/${req.file.filename}`;
                updateData.pdfFilename = req.file.originalname;
                // Si on upload un fichier, ce n'est plus un lien externe
                updateData.isExternalLink = false;
                updateData.externalUrl = null;
            }

            const document = await prisma.document.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            res.redirect('/documents/admin?success=' + encodeURIComponent('Document mis à jour avec succès'));

        } catch (error) {
            console.error('Erreur lors de la mise à jour du document:', error);
            res.redirect('/documents/admin?error=' + encodeURIComponent('Erreur lors de la mise à jour du document'));
        }
    },

    // Supprimer un document
    async deleteDocument(req, res) {
        try {
            const { id } = req.params;

            await prisma.document.delete({
                where: { id: parseInt(id) }
            });

            res.redirect('/documents/admin?success=' + encodeURIComponent('Document supprimé avec succès'));

        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            res.redirect('/documents/admin?error=' + encodeURIComponent('Erreur lors de la suppression du document'));
        }
    },

    // Activer/désactiver un document
    async toggleDocument(req, res) {
        try {
            const { id } = req.params;

            const document = await prisma.document.findUnique({
                where: { id: parseInt(id) }
            });

            if (!document) {
                return res.redirect('/documents/admin?error=' + encodeURIComponent('Document non trouvé'));
            }

            const updatedDocument = await prisma.document.update({
                where: { id: parseInt(id) },
                data: { active: !document.active }
            });

            const message = updatedDocument.active ? 'Document activé' : 'Document désactivé';
            res.redirect('/documents/admin?success=' + encodeURIComponent(message));

        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            res.redirect('/documents/admin?error=' + encodeURIComponent('Erreur lors du changement de statut'));
        }
    },

    // Nouvelles méthodes publiques
    async getDocumentsByCategory(req, res) {
        try {
            const { category } = req.params;


            let documentTypes = [];
            let pageTitle = '';

            if (category === 'ecole') {
                documentTypes = [
                    'PROJET_EDUCATIF',
                    'PROJET_ETABLISSEMENT',
                    'REGLEMENT_INTERIEUR',
                    'ORGANIGRAMME',
                    'AGENDA',
                    'CHARTE_LAICITE',
                    'CHARTE_NUMERIQUE',
                    'CHARTE_VIE_SCOLAIRE',
                    'CHARTE_RESTAURATION'
                ];
                pageTitle = 'Documents de l\'École';
            } else if (category === 'pastorale') {
                documentTypes = [
                    'PASTORALE_AXE',
                    'PASTORALE_TEMPS_PRIANT',
                    'PASTORALE_ENSEMBLE'
                ];
                pageTitle = 'Documents Pastorale';
            } else if (category === 'apel') {
                documentTypes = [
                    'APEL_COMPTES_RENDUS',
                    'APEL_PROJETS',
                    'APEL_INFORMATIONS',
                    'APEL_EVENEMENTS'
                ];
                pageTitle = 'Documents APEL';
            } else {
                return res.status(404).render('errors/404.twig');
            }

            const documents = await prisma.document.findMany({
                where: {
                    type: { in: documentTypes },
                    active: true
                },
                include: {
                    auteur: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: [
                    { type: 'asc' },
                    { updatedAt: 'desc' }
                ]
            });


            // Grouper par type
            const documentsByType = {};
            documents.forEach(doc => {
                if (!documentsByType[doc.type]) {
                    documentsByType[doc.type] = [];
                }
                documentsByType[doc.type].push(doc);
            });

            res.render('pages/documents/category.twig', {
                category,
                pageTitle,
                documentsByType,
                documents,
                isAuthenticated: !!req.session.user,
                user: req.session.user || null
            });

        } catch (error) {
            console.error('[getDocumentsByCategory] Erreur:', error);
            res.status(500).render('errors/500.twig', { error: error.message });
        }
    },

    async showPublicDocument(req, res) {
        try {
            const { id } = req.params;


            const document = await prisma.document.findUnique({
                where: {
                    id: parseInt(id),
                    active: true
                },
                include: {
                    auteur: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });

            if (!document) {
                return res.status(404).render('errors/404.twig');
            }


            res.render('pages/documents/show.twig', {
                document
            });

        } catch (error) {
            console.error('[showPublicDocument] Erreur:', error);
            res.status(500).render('errors/500.twig', { error: error.message });
        }
    }
};

module.exports = documentController;
