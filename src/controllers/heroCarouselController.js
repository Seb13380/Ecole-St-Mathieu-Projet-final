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
            // Vérifier que l'utilisateur a les permissions (DIRECTION, GESTIONNAIRE_SITE ou ADMIN)
            if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE', 'ADMIN'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'Accès non autorisé. Seuls les directeurs, administrateurs et le responsable maintenance peuvent gérer les images.',
                    title: 'Accès refusé'
                });
            }

            // Récupérer toutes les images hero carousel
            const images = await prisma.heroCarousel.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { ordre: 'asc' }
            });

            // Ajouter les URLs des images
            const imagesWithUrls = images.map(image => ({
                ...image,
                originalUrl: `/uploads/hero-carousel/${image.filename}`
            }));

            // Calculer les statistiques
            const stats = {
                total: images.length,
                active: images.filter(img => img.active).length,
                inactive: images.filter(img => !img.active).length
            };

            res.render('pages/admin/hero-carousel-management', {
                title: 'Gestion du Carrousel Principal',
                images: imagesWithUrls,
                stats: stats,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des images hero carousel:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des images du carrousel principal.',
                title: 'Erreur serveur'
            });
        }
    },

    // Ajouter une nouvelle image au hero carousel
    addImage: [
        upload.single('image'),
        async (req, res) => {
            try {
                // Vérifier que l'utilisateur a les permissions
                if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE', 'ADMIN'].includes(req.session.user.role)) {
                    return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Accès non autorisé.'));
                }

                if (!req.file) {
                    return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Aucun fichier image fourni.'));
                }

                const { titre, description, ordre } = req.body;

                // Utiliser l'ordre fourni ou calculer le prochain ordre disponible
                let finalOrdre = parseInt(ordre) || 0;
                if (finalOrdre === 0) {
                    const lastImage = await prisma.heroCarousel.findFirst({
                        orderBy: { ordre: 'desc' }
                    });
                    finalOrdre = lastImage ? lastImage.ordre + 1 : 1;
                }

                // Créer l'entrée en base de données
                const newHeroImage = await prisma.heroCarousel.create({
                    data: {
                        filename: req.file.filename,
                        originalUrl: `/uploads/hero-carousel/${req.file.filename}`,
                        titre: titre || null,
                        description: description || null,
                        ordre: finalOrdre,
                        active: true,
                        auteurId: req.session.user.id
                    },
                    include: {
                        auteur: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                });

                    filename: newHeroImage.filename,
                    titre: newHeroImage.titre,
                    auteur: `${newHeroImage.auteur.firstName} ${newHeroImage.auteur.lastName}`
                });

                res.redirect('/hero-carousel/management?success=' + encodeURIComponent('Image ajoutée avec succès au carrousel principal.'));
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

                res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Erreur lors de l\'ajout de l\'image au carrousel principal.'));
            }
        }
    ],

    // Mettre à jour une image hero carousel
    updateImage: async (req, res) => {
        try {
            const { id } = req.params;
            const { titre, description, ordre, active } = req.body;

            // Vérifier que l'utilisateur a les permissions
            if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE', 'ADMIN'].includes(req.session.user.role)) {
                return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Accès non autorisé.'));
            }

            const updatedHeroImage = await prisma.heroCarousel.update({
                where: { id: parseInt(id) },
                data: {
                    titre: titre || null,
                    description: description || null,
                    ordre: ordre ? parseInt(ordre) : undefined,
                    active: active === 'on'
                },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

                id: updatedHeroImage.id,
                titre: updatedHeroImage.titre,
                active: updatedHeroImage.active
            });

            res.redirect('/hero-carousel/management?success=' + encodeURIComponent('Image mise à jour avec succès.'));
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'image hero carousel:', error);
            res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Erreur lors de la mise à jour de l\'image.'));
        }
    },

    // Supprimer une image hero carousel
    deleteImage: async (req, res) => {
        try {
            const { id } = req.params;

            // Vérifier que l'utilisateur a les permissions
            if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE', 'ADMIN'].includes(req.session.user.role)) {
                return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Accès non autorisé.'));
            }

            // Récupérer l'image avant de la supprimer
            const heroImage = await prisma.heroCarousel.findUnique({
                where: { id: parseInt(id) }
            });

            if (!heroImage) {
                return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Image non trouvée.'));
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

                id: heroImage.id,
                filename: heroImage.filename,
                titre: heroImage.titre
            });

            res.redirect('/hero-carousel/management?success=' + encodeURIComponent('Image supprimée avec succès.'));
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'image hero carousel:', error);
            res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Erreur lors de la suppression de l\'image.'));
        }
    },

    // Basculer le statut actif/inactif d'une image hero carousel
    toggleStatus: async (req, res) => {
        try {
            const { id } = req.params;

            // Vérifier que l'utilisateur a les permissions
            if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE', 'ADMIN'].includes(req.session.user.role)) {
                return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Accès non autorisé.'));
            }

            // Récupérer l'image actuelle
            const heroImage = await prisma.heroCarousel.findUnique({
                where: { id: parseInt(id) }
            });

            if (!heroImage) {
                return res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Image non trouvée.'));
            }

            // Basculer le statut
            const updatedHeroImage = await prisma.heroCarousel.update({
                where: { id: parseInt(id) },
                data: { active: !heroImage.active }
            });

                id: updatedHeroImage.id,
                titre: updatedHeroImage.titre || 'Sans titre',
                active: updatedHeroImage.active
            });

            res.redirect('/hero-carousel/management?success=' + encodeURIComponent(`Image ${updatedHeroImage.active ? 'activée' : 'désactivée'} avec succès.`));
        } catch (error) {
            console.error('Erreur lors du changement de statut de l\'image hero carousel:', error);
            res.redirect('/hero-carousel/management?error=' + encodeURIComponent('Erreur lors du changement de statut de l\'image.'));
        }
    }
};

module.exports = heroCarouselController;
