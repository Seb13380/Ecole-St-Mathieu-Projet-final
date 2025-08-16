const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration de Multer pour l'upload d'images du hero carousel
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/hero-carousel');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Générer un nom unique pour le fichier
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'hero-' + uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accepter seulement les images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image sont autorisés!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

const heroCarouselController = {
    // Afficher la page de gestion des images hero carousel
    showManagement: async (req, res) => {
        try {
            // Vérifier que l'utilisateur a les permissions (DIRECTION ou MAINTENANCE_SITE)
            if (!req.session.user || !['DIRECTION', 'MAINTENANCE_SITE'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'Accès non autorisé. Seuls les directeurs et le responsable maintenance peuvent gérer les images.'
                });
            }

            // Récupérer toutes les images hero carousel
            const heroImages = await prisma.heroCarousel.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { ordre: 'asc' }
            });

            res.render('pages/admin/hero-carousel-management', {
                title: 'Gestion du Carrousel Principal',
                heroImages: heroImages,
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des images hero carousel:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des images du carrousel principal.'
            });
        }
    },

    // Ajouter une nouvelle image au hero carousel
    addImage: [
        upload.single('heroImage'),
        async (req, res) => {
            try {
                // Vérifier que l'utilisateur a les permissions
                if (!req.session.user || !['DIRECTION', 'MAINTENANCE_SITE'].includes(req.session.user.role)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Accès non autorisé.'
                    });
                }

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Aucun fichier image fourni.'
                    });
                }

                const { titre, description } = req.body;

                // Récupérer le prochain ordre disponible
                const lastImage = await prisma.heroCarousel.findFirst({
                    orderBy: { ordre: 'desc' }
                });
                const nextOrdre = lastImage ? lastImage.ordre + 1 : 1;

                // Créer l'entrée en base de données
                const newHeroImage = await prisma.heroCarousel.create({
                    data: {
                        filename: req.file.filename,
                        originalUrl: req.file.originalname,
                        titre: titre || null,
                        description: description || null,
                        ordre: nextOrdre,
                        active: true,
                        auteurId: req.session.user.id
                    },
                    include: {
                        auteur: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                });

                console.log('🖼️ Nouvelle image hero carousel ajoutée:', {
                    filename: newHeroImage.filename,
                    titre: newHeroImage.titre,
                    auteur: `${newHeroImage.auteur.firstName} ${newHeroImage.auteur.lastName}`
                });

                res.json({
                    success: true,
                    message: 'Image ajoutée avec succès au carrousel principal.',
                    heroImage: newHeroImage
                });
            } catch (error) {
                console.error('Erreur lors de l\'ajout d\'image hero carousel:', error);

                // Supprimer le fichier uploadé en cas d'erreur
                if (req.file) {
                    try {
                        fs.unlinkSync(req.file.path);
                    } catch (deleteError) {
                        console.error('Erreur lors de la suppression du fichier:', deleteError);
                    }
                }

                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'ajout de l\'image au carrousel principal.'
                });
            }
        }
    ],

    // Mettre à jour une image hero carousel
    updateImage: async (req, res) => {
        try {
            const { id } = req.params;
            const { titre, description, ordre } = req.body;

            // Vérifier que l'utilisateur a les permissions
            if (!req.session.user || !['DIRECTION', 'MAINTENANCE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé.'
                });
            }

            const updatedHeroImage = await prisma.heroCarousel.update({
                where: { id: parseInt(id) },
                data: {
                    titre: titre || null,
                    description: description || null,
                    ordre: ordre ? parseInt(ordre) : undefined
                },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Image hero carousel mise à jour avec succès.',
                heroImage: updatedHeroImage
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'image hero carousel:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'image.'
            });
        }
    },

    // Supprimer une image hero carousel
    deleteImage: async (req, res) => {
        try {
            const { id } = req.params;

            // Vérifier que l'utilisateur a les permissions
            if (!req.session.user || !['DIRECTION', 'MAINTENANCE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé.'
                });
            }

            // Récupérer l'image avant de la supprimer
            const heroImage = await prisma.heroCarousel.findUnique({
                where: { id: parseInt(id) }
            });

            if (!heroImage) {
                return res.status(404).json({
                    success: false,
                    message: 'Image non trouvée.'
                });
            }

            // Supprimer l'entrée de la base de données
            await prisma.heroCarousel.delete({
                where: { id: parseInt(id) }
            });

            // Supprimer le fichier physique
            const filePath = path.join(__dirname, '../../public/uploads/hero-carousel', heroImage.filename);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (deleteError) {
                console.error('Erreur lors de la suppression du fichier:', deleteError);
            }

            res.json({
                success: true,
                message: 'Image hero carousel supprimée avec succès.'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image hero carousel:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'image.'
            });
        }
    },

    // Basculer le statut actif/inactif d'une image hero carousel
    toggleStatus: async (req, res) => {
        try {
            const { id } = req.params;

            // Vérifier que l'utilisateur a les permissions
            if (!req.session.user || !['DIRECTION', 'MAINTENANCE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé.'
                });
            }

            // Récupérer l'image actuelle
            const heroImage = await prisma.heroCarousel.findUnique({
                where: { id: parseInt(id) }
            });

            if (!heroImage) {
                return res.status(404).json({
                    success: false,
                    message: 'Image non trouvée.'
                });
            }

            // Basculer le statut
            const updatedHeroImage = await prisma.heroCarousel.update({
                where: { id: parseInt(id) },
                data: { active: !heroImage.active }
            });

            res.json({
                success: true,
                message: `Image ${updatedHeroImage.active ? 'activée' : 'désactivée'} avec succès.`,
                heroImage: updatedHeroImage
            });
        } catch (error) {
            console.error('Erreur lors du changement de statut de l\'image hero carousel:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du changement de statut de l\'image.'
            });
        }
    }
};

module.exports = heroCarouselController;
