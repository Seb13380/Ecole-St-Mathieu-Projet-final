const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const prisma = new PrismaClient();

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/uploads/carousel');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Générer un nom unique avec timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `carousel-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accepter seulement les images JPEG, PNG et WebP
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées (JPEG, PNG, WebP)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

const carouselController = {
    // Afficher la page de gestion du carousel
    async showManagement(req, res) {
        try {

            // Vérifier les permissions (DIRECTION ou MAINTENANCE_SITE)
            const allowedRoles = ['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE'];
            if (!allowedRoles.includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'Accès refusé - Réservé à la direction et à la maintenance'
                });
            }

            // Récupérer toutes les images du carousel
            const images = await prisma.carouselImage.findMany({
                include: {
                    auteur: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: [
                    { ordre: 'asc' },
                    { createdAt: 'desc' }
                ]
            });

            // Statistiques
            const stats = {
                total: images.length,
                active: images.filter(img => img.active).length,
                inactive: images.filter(img => !img.active).length
            };

            res.render('pages/admin/carousel-management', {
                title: 'Gestion du Carousel - Images',
                images,
                stats,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

        } catch (error) {
            console.error('❌ Erreur gestion carousel:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement de la gestion du carousel'
            });
        }
    },

    // Ajouter une nouvelle image
    async addImage(req, res) {
        const uploadSingle = upload.single('image');

        uploadSingle(req, res, async function (err) {
            try {
                if (err) {
                    console.error('❌ Erreur upload:', err);
                    return res.redirect('/carousel/manage?error=' + encodeURIComponent(err.message));
                }

                if (!req.file) {
                    return res.redirect('/carousel/manage?error=' + encodeURIComponent('Aucune image sélectionnée'));
                }

                const { titre, description, ordre } = req.body;

                // Créer l'enregistrement en base
                const newImage = await prisma.carouselImage.create({
                    data: {
                        filename: req.file.filename,
                        originalUrl: `/uploads/carousel/${req.file.filename}`,
                        titre: titre || null,
                        description: description || null,
                        ordre: parseInt(ordre) || 0,
                        active: true,
                        auteurId: req.session.user.id
                    }
                });

                    id: newImage.id,
                    filename: newImage.filename,
                    auteur: req.session.user.email
                });

                res.redirect('/carousel/manage?success=' + encodeURIComponent('Image ajoutée avec succès au carousel'));

            } catch (error) {
                console.error('❌ Erreur ajout image carousel:', error);

                // Supprimer le fichier en cas d'erreur
                if (req.file) {
                    try {
                        await fs.unlink(req.file.path);
                    } catch (unlinkError) {
                        console.error('❌ Erreur suppression fichier:', unlinkError);
                    }
                }

                res.redirect('/carousel/manage?error=' + encodeURIComponent('Erreur lors de l\'ajout de l\'image'));
            }
        });
    },

    // Modifier une image
    async updateImage(req, res) {
        try {
            const { id } = req.params;
            const { titre, description, ordre, active } = req.body;

                id,
                titre,
                ordre,
                active,
                body: req.body
            });

            // Gérer la checkbox active
            const isActive = active === 'on' || active === 'true' || active === true || active === '1';

            const updatedImage = await prisma.carouselImage.update({
                where: { id: parseInt(id) },
                data: {
                    titre: titre || null,
                    description: description || null,
                    ordre: parseInt(ordre) || 0,
                    active: isActive,
                    updatedAt: new Date()
                }
            });

                id: updatedImage.id,
                titre: updatedImage.titre,
                active: updatedImage.active
            });

            res.redirect('/carousel/manage?success=' + encodeURIComponent('Image modifiée avec succès'));

        } catch (error) {
            console.error('❌ Erreur modification image:', error);
            console.error('❌ Détails erreur:', error.message);
            res.redirect('/carousel/manage?error=' + encodeURIComponent('Erreur lors de la modification: ' + error.message));
        }
    },

    // Supprimer une image
    async deleteImage(req, res) {
        try {
            const { id } = req.params;


            // Récupérer l'image pour obtenir le nom du fichier
            const image = await prisma.carouselImage.findUnique({
                where: { id: parseInt(id) }
            });

            if (!image) {
                return res.redirect('/carousel/manage?error=' + encodeURIComponent('Image non trouvée'));
            }

            // Supprimer l'enregistrement de la base
            await prisma.carouselImage.delete({
                where: { id: parseInt(id) }
            });

            // Supprimer le fichier physique
            try {
                const filePath = path.join(__dirname, '../../public/uploads/carousel', image.filename);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.warn('⚠️ Fichier physique non trouvé:', image.filename);
            }

            res.redirect('/carousel/manage?success=' + encodeURIComponent('Image supprimée avec succès'));

        } catch (error) {
            console.error('❌ Erreur suppression image:', error);
            res.redirect('/carousel/manage?error=' + encodeURIComponent('Erreur lors de la suppression'));
        }
    },

    // Basculer l'état actif/inactif
    async toggleStatus(req, res) {
        try {
            const { id } = req.params;


            const image = await prisma.carouselImage.findUnique({
                where: { id: parseInt(id) }
            });

            if (!image) {
                return res.redirect('/carousel/manage?error=' + encodeURIComponent('Image non trouvée'));
            }

            const updatedImage = await prisma.carouselImage.update({
                where: { id: parseInt(id) },
                data: {
                    active: !image.active,
                    updatedAt: new Date()
                }
            });

            const message = updatedImage.active ? 'Image activée' : 'Image désactivée';

            res.redirect('/carousel/manage?success=' + encodeURIComponent(message));

        } catch (error) {
            console.error('❌ Erreur changement statut:', error);
            res.redirect('/carousel/manage?error=' + encodeURIComponent('Erreur lors du changement de statut'));
        }
    },

    // API pour récupérer les images actives (pour le carousel public)
    async getActiveImages(req, res) {
        try {
            const images = await prisma.carouselImage.findMany({
                where: { active: true },
                select: {
                    id: true,
                    filename: true,
                    originalUrl: true,
                    titre: true,
                    description: true,
                    ordre: true
                },
                orderBy: [
                    { ordre: 'asc' },
                    { createdAt: 'desc' }
                ]
            });

            res.json({
                success: true,
                images: images
            });

        } catch (error) {
            console.error('❌ Erreur récupération images actives:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des images'
            });
        }
    }
};

module.exports = carouselController;
