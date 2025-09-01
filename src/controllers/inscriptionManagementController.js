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
        // Générer un nom unique pour le fichier
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
            cb(new Error('Seuls les fichiers PDF sont autorisés!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

const inscriptionManagementController = {

    // ============ GESTION DE LA CONFIGURATION ============

    async getInscriptionManagement(req, res) {
        try {
            console.log('🔍 Accès à la gestion des inscriptions par:', req.session.user?.email);

            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'Accès refusé - Réservé à la direction et gestionnaire site',
                    user: req.session.user
                });
            }

            // Récupérer la configuration actuelle
            let config = await prisma.inscriptionConfig.findFirst({
                where: { actif: true },
                include: {
                    modificateur: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            // Si aucune config n'existe, en créer une par défaut
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
                console.log('✅ Configuration par défaut créée');
            }

            // Récupérer les documents d'inscription
            const documents = await prisma.inscriptionDocument.findMany({
                where: { actif: true },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { ordre: 'asc' }
            });

            console.log('📊 Données récupérées:');
            console.log('   - Configuration:', config.soustitre);
            console.log('   - Documents actifs:', documents.length);

            res.render('pages/admin/inscription-management', {
                config,
                documents,
                title: 'Gestion des Inscriptions',
                user: req.session.user
            });

        } catch (error) {
            console.error('❌ Erreur lors de la récupération de la gestion des inscriptions:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement de la gestion des inscriptions',
                user: req.session.user
            });
        }
    },

    async updateInscriptionConfig(req, res) {
        try {
            console.log('🔄 Mise à jour configuration inscription par:', req.session.user?.email);

            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { soustitre, afficherAnnoncePS2026 } = req.body;

            if (!soustitre || soustitre.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Le sous-titre ne peut pas être vide'
                });
            }

            // Désactiver l'ancienne configuration
            await prisma.inscriptionConfig.updateMany({
                where: { actif: true },
                data: { actif: false }
            });

            // Créer la nouvelle configuration
            const newConfig = await prisma.inscriptionConfig.create({
                data: {
                    soustitre: soustitre.trim(),
                    afficherAnnoncePS2026: Boolean(afficherAnnoncePS2026),
                    actif: true,
                    modifiePar: req.session.user.id
                }
            });

            console.log('✅ Configuration mise à jour:', { soustitre, afficherAnnoncePS2026: Boolean(afficherAnnoncePS2026) });

            res.json({
                success: true,
                message: 'Configuration mise à jour avec succès',
                config: newConfig
            });

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de la configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la configuration'
            });
        }
    },

    // ============ GESTION DES DOCUMENTS ============

    async addDocument(req, res) {
        try {
            console.log('📁 Ajout document inscription par:', req.session.user?.email);

            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
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
                    message: 'Aucun fichier sélectionné pour un document de type fichier'
                });
            }

            if (type === 'LINK' && (!lienExterne || lienExterne.trim().length === 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Le lien externe est requis pour un document de type lien'
                });
            }

            // Créer l'entrée en base de données
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
                // Supprimer le fichier s'il a été uploadé par erreur
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

            console.log('✅ Document ajouté:', nom, '- Type:', type);

            res.json({
                success: true,
                message: 'Document ajouté avec succès',
                document
            });

        } catch (error) {
            console.error('❌ Erreur lors de l\'upload du document:', error);

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
            console.log('🗑️  Suppression document inscription par:', req.session.user?.email);

            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { id } = req.params;

            const document = await prisma.inscriptionDocument.findUnique({
                where: { id: parseInt(id) }
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvé'
                });
            }

            // Supprimer le fichier physique seulement s'il s'agit d'un fichier
            if (document.type === 'FILE' && document.cheminFichier) {
                try {
                    await fs.unlink(document.cheminFichier);
                    console.log('🗑️  Fichier physique supprimé:', document.nomFichier);
                } catch (error) {
                    console.warn('⚠️  Impossible de supprimer le fichier physique:', error.message);
                }
            }

            // Supprimer l'entrée en base de données
            await prisma.inscriptionDocument.delete({
                where: { id: parseInt(id) }
            });

            console.log('✅ Document supprimé:', document.nom, '- Type:', document.type);

            res.json({
                success: true,
                message: 'Document supprimé avec succès'
            });

        } catch (error) {
            console.error('❌ Erreur lors de la suppression du document:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du document'
            });
        }
    },

    async updateDocumentOrder(req, res) {
        try {
            console.log('🔄 Mise à jour ordre documents par:', req.session.user?.email);

            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { documents } = req.body; // Array d'objets {id, ordre}

            if (!Array.isArray(documents)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format de données invalide'
                });
            }

            // Mettre à jour l'ordre de chaque document
            const updatePromises = documents.map(doc =>
                prisma.inscriptionDocument.update({
                    where: { id: parseInt(doc.id) },
                    data: { ordre: parseInt(doc.ordre) }
                })
            );

            await Promise.all(updatePromises);

            console.log('✅ Ordre des documents mis à jour');

            res.json({
                success: true,
                message: 'Ordre des documents mis à jour avec succès'
            });

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de l\'ordre:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'ordre'
            });
        }
    },

    // ============ API PUBLIQUE POUR LA PAGE D'INSCRIPTION ============

    async getInscriptionData(req, res) {
        try {
            console.log('📄 Récupération données inscription publiques');

            // Récupérer la configuration active
            const config = await prisma.inscriptionConfig.findFirst({
                where: { actif: true }
            });

            // Récupérer les documents actifs (seulement les fichiers PDF pour la page publique)
            const documents = await prisma.inscriptionDocument.findMany({
                where: {
                    actif: true,
                    type: 'FILE' // Seulement les fichiers PDF pour téléchargement
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
            console.error('❌ Erreur lors de la récupération des données d\'inscription:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du chargement des données'
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
                    message: 'Document non trouvé'
                });
            }

            // Si c'est un lien externe, rediriger
            if (document.type === 'LINK') {
                return res.redirect(document.lienExterne);
            }

            // Si c'est un fichier, vérifier qu'il existe
            if (document.type === 'FILE') {
                try {
                    await fs.access(document.cheminFichier);
                } catch (error) {
                    console.error('❌ Fichier physique non trouvé:', document.cheminFichier);
                    return res.status(404).json({
                        success: false,
                        message: 'Fichier non disponible'
                    });
                }

                console.log('📥 Téléchargement document:', document.nom, 'par IP:', req.ip);

                // Configurer les headers pour le téléchargement
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${document.nom}.pdf"`);

                // Envoyer le fichier
                res.sendFile(path.resolve(document.cheminFichier));
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Type de document non supporté'
                });
            }

        } catch (error) {
            console.error('❌ Erreur lors du téléchargement:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    },

    // Middleware multer pour l'upload
    uploadMiddleware: upload.single('document')
};

// ============ FONCTIONS UTILITAIRES ============

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
