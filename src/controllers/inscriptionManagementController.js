const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuration multer pour l'upload de PDF
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/inscription-documents');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // GÃ©nÃ©rer un nom unique pour le fichier
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `inscription-doc-${uniqueSuffix}${extension}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accepter seulement les PDF
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont autorisÃ©s!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

const inscriptionManagementController = {

    // ===== GESTION DE LA CONFIGURATION =====

    async getInscriptionManagement(req, res) {
        try {
            console.log('ðŸ” AccÃ¨s Ã  la gestion des inscriptions par:', req.session.user?.email);

            // VÃ©rifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'AccÃ¨s refusÃ© - RÃ©servÃ© Ã  la direction et gestionnaire site',
                    user: req.session.user
                });
            }

            // RÃ©cupÃ©rer la configuration actuelle
            let config = await prisma.inscriptionConfig.findFirst({
                where: { actif: true },
                include: {
                    modificateur: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            // Si aucune config n'existe, en crér une par dÃ©faut
            if (!config) {
                config = await prisma.inscriptionConfig.create({
                    data: {
                        soustitre: "Demande d'inscription pour l'année scolaire 2025-2026",
                        actif: true,
                        modifiePar: req.session.user.id
                    },
                    include: {
                        modificateur: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                });
                console.log('âœ… Configuration par défaut créée');
            }

            // RÃ©cupÃ©rer les documents d'inscription
            const documents = await prisma.inscriptionDocument.findMany({
                where: { actif: true },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { ordre: 'asc' }
            });

            console.log('ðŸ“Š Donnés rÃ©cupÃ©rés:');
            console.log('   - Configuration:', config.soustitre);
            console.log('   - Documents actifs:', documents.length);

            res.render('pages/admin/inscription-management', {
                config,
                documents,
                title: 'Gestion des Inscriptions',
                user: req.session.user
            });

        } catch (error) {
            console.error('âŒ Erreur lors de la rÃ©cupÃ©ration de la gestion des inscriptions:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement de la gestion des inscriptions',
                user: req.session.user
            });
        }
    },

    async updateInscriptionConfig(req, res) {
        try {
            console.log('ðŸ”„ Mise Ã  jour configuration inscription par:', req.session.user?.email);

            // VÃ©rifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'AccÃ¨s refusÃ©' });
            }

            const { soustitre, afficherAnnoncePS2026 } = req.body;

            if (!soustitre || soustitre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Le sous-titre ne peut pas Ãªtre vide'
                });
            }

            // DÃ©sactiver l'ancienne configuration
            await prisma.inscriptionConfig.updateMany({
                where: { actif: true },
                data: { actif: false }
            });

            // Crér la nouvelle configuration
            const newConfig = await prisma.inscriptionConfig.create({
                data: {
                    soustitre: soustitre.trim(),
                    afficherAnnoncePS2026: Boolean(afficherAnnoncePS2026),
                    actif: true,
                    modifiePar: req.session.user.id
                }
            });

            console.log('âœ… Configuration mise Ã  jour:', { soustitre, afficherAnnoncePS2026: Boolean(afficherAnnoncePS2026) });

            res.json({
                success: true,
                message: 'Configuration mise Ã  jour avec succÃ¨s',
                config: newConfig
            });

        } catch (error) {
            console.error('âŒ Erreur lors de la mise Ã  jour de la configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise Ã  jour de la configuration'
            });
        }
    },

    // ===== GESTION DES DOCUMENTS =====

    async addDocument(req, res) {
        try {
            console.log('ðŸ“ Ajout document inscription par:', req.session.user?.email);

            // VÃ©rifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'AccÃ¨s refusÃ©' });
            }

            const { nom, description, type, lienExterne } = req.body;

            if (!nom || nom.trim().length === 0) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch(console.error);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Le nom du document est requis'
                });
            }

            if (!type || !['FILE', 'LINK'].includes(type)) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch(console.error);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Type de document invalide'
                });
            }

            // Validation selon le type
            if (type === 'FILE' && !req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier sÃ©lectionnÃ© pour un document de type fichier'
                });
            }

            if (type === 'LINK' && (!lienExterne || lienExterne.trim().length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Le lien externe est requis pour un document de type lien'
                });
            }

            // Crér l'entré en base de donnés
            const documentData = {
                nom: nom.trim(),
                description: description?.trim() || null,
                type: type,
                ordre: await getNextOrderValue(),
                actif: true,
                ajoutePar: req.session.user.id
            };

            if (type === 'FILE') {
                documentData.nomFichier = req.file.filename;
                documentData.cheminFichier = req.file.path;
                documentData.taille = req.file.size;
            } else if (type === 'LINK') {
                documentData.lienExterne = lienExterne.trim();
                // Supprimer le fichier s'il a Ã©tÃ© uploadÃ© par erreur
                if (req.file) {
                    await fs.unlink(req.file.path).catch(console.error);
                }
            }

            const document = await prisma.inscriptionDocument.create({
                data: documentData,
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            console.log('âœ… Document ajoutÃ©:', nom, '- Type:', type);

            res.json({
                success: true,
                message: 'Document ajoutÃ© avec succÃ¨s',
                document
            });

        } catch (error) {
            console.error('âŒ Erreur lors de l\'upload du document:', error);

            // Supprimer le fichier en cas d'erreur
            if (req.file) {
                await fs.unlink(req.file.path).catch(console.error);
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout du document'
            });
        }
    },

    async deleteDocument(req, res) {
        try {
            console.log('ðŸ—‘ï¸  Suppression document inscription par:', req.session.user?.email);

            // VÃ©rifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'AccÃ¨s refusÃ©' });
            }

            const { id } = req.params;

            const document = await prisma.inscriptionDocument.findUnique({
                where: { id: parseInt(id) }
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvÃ©'
                });
            }

            // Supprimer le fichier physique seulement s'il s'agit d'un fichier
            if (document.type === 'FILE' && document.cheminFichier) {
                try {
                    await fs.unlink(document.cheminFichier);
                    console.log('ðŸ—‘ï¸  Fichier physique supprimÃ©:', document.nomFichier);
                } catch (error) {
                    console.warn('âš ï¸  Impossible de supprimer le fichier physique:', error.message);
                }
            }

            // Supprimer l'entré en base de donnés
            await prisma.inscriptionDocument.delete({
                where: { id: parseInt(id) }
            });

            console.log('âœ… Document supprimÃ©:', document.nom, '- Type:', document.type);

            res.json({
                success: true,
                message: 'Document supprimÃ© avec succÃ¨s'
            });

        } catch (error) {
            console.error('âŒ Erreur lors de la suppression du document:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du document'
            });
        }
    },

    async updateDocumentOrder(req, res) {
        try {
            console.log('ðŸ”„ Mise Ã  jour ordre documents par:', req.session.user?.email);

            // VÃ©rifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'AccÃ¨s refusÃ©' });
            }

            const { documents } = req.body; // Array d'objets {id, ordre}

            if (!Array.isArray(documents)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format de donnés invalide'
                });
            }

            // Mettre Ã  jour l'ordre de chaque document
            const updatePromises = documents.map(doc =>
                prisma.inscriptionDocument.update({
                    where: { id: parseInt(doc.id) },
                    data: { ordre: parseInt(doc.ordre) }
                })
            );

            await Promise.all(updatePromises);

            console.log('âœ… Ordre des documents mis Ã  jour');

            res.json({
                success: true,
                message: 'Ordre des documents mis Ã  jour avec succÃ¨s'
            });

        } catch (error) {
            console.error('âŒ Erreur lors de la mise Ã  jour de l\'ordre:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise Ã  jour de l\'ordre'
            });
        }
    },

    // ===== API PUBLIQUE POUR LA PAGE D'INSCRIPTION =====

    async getInscriptionData(req, res) {
        try {
            console.log('ðŸ“„ RÃ©cupÃ©ration donnés inscription publiques');

            // RÃ©cupÃ©rer la configuration active
            const config = await prisma.inscriptionConfig.findFirst({
                where: { actif: true }
            });

            // RÃ©cupÃ©rer les documents actifs (seulement les fichiers PDF pour la page publique)
            const documents = await prisma.inscriptionDocument.findMany({
                where: {
                    actif: true,
                    type: 'FILE' // Seulement les fichiers PDF pour tÃ©lÃ©chargement
                },
                select: {
                    id: true,
                    nom: true,
                    description: true,
                    taille: true,
                    ordre: true
                },
                orderBy: { ordre: 'asc' }
            });

            res.json({
                success: true,
                config: config || {
                    soustitre: "Demande d'inscription pour l'année scolaire 2025-2026",
                    afficherAnnoncePS2026: false
                },
                documents
            });

        } catch (error) {
            console.error('âŒ Erreur lors de la rÃ©cupÃ©ration des donnés d\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du chargement des donnés'
            });
        }
    },

    async downloadDocument(req, res) {
        try {
            const { id } = req.params;

            const document = await prisma.inscriptionDocument.findUnique({
                where: {
                    id: parseInt(id),
                    actif: true
                }
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvÃ©'
                });
            }

            // Si c'est un lien externe, rediriger
            if (document.type === 'LINK') {
                return res.redirect(document.lienExterne);
            }

            // Si c'est un fichier, vÃ©rifier qu'il existe
            if (document.type === 'FILE') {
                try {
                    await fs.access(document.cheminFichier);
                } catch (error) {
                    console.error('âŒ Fichier physique non trouvÃ©:', document.cheminFichier);
                    return res.status(404).json({
                        success: false,
                        message: 'Fichier non disponible'
                    });
                }

                console.log('ðŸ“¥ TÃ©lÃ©chargement document:', document.nom, 'par IP:', req.ip);

                // Configurer les headers pour le tÃ©lÃ©chargement
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${document.nom}.pdf"`);

                // Envoyer le fichier
                res.sendFile(path.resolve(document.cheminFichier));
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Type de document non supportÃ©'
                });
            }

        } catch (error) {
            console.error('âŒ Erreur lors du tÃ©lÃ©chargement:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    },

    // Middleware multer pour l'upload
    uploadMiddleware: upload.single('document')
};

// ===== FONCTIONS UTILITAIRES =====

async function getNextOrderValue() {
    const lastDocument = await prisma.inscriptionDocument.findFirst({
        where: { actif: true },
        orderBy: { ordre: 'desc' }
    });
    return lastDocument ? lastDocument.ordre + 1 : 1;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = inscriptionManagementController;

