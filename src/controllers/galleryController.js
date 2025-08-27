const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration multer pour l'upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/gallery');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000000);
        const extension = path.extname(file.originalname);
        cb(null, `gallery-${timestamp}-${randomNum}${extension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: function (req, file, cb) {
        // Accepter images et vidéos
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image et vidéo sont autorisés'));
        }
    }
});

// Afficher la galerie publique
const showGallery = async (req, res) => {
    try {
        // Récupérer tous les thèmes avec leurs médias
        const themes = await prisma.galleryTheme.findMany({
            include: {
                medias: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.render('pages/gallery', {
            title: 'Images et Vidéos',
            themes,
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Erreur lors du chargement de la galerie:', error);
        res.status(500).render('pages/error', {
            title: 'Erreur',
            message: 'Erreur lors du chargement de la galerie',
            isAuthenticated: req.session.user ? true : false,
            user: req.session.user || null
        });
    }
};

// Admin - Afficher la gestion de la galerie
const showAdminGallery = async (req, res) => {
    try {
        console.log('=== DEBUG GALLERY ADMIN ===');
        console.log('User:', req.session.user);
        console.log('User role:', req.session.user?.role);
        console.log('=========================');

        // Récupérer tous les thèmes avec leurs médias
        const themes = await prisma.galleryTheme.findMany({
            include: {
                medias: {
                    include: {
                        auteur: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        console.log('Themes found:', themes.length);

        res.render('admin/gallery', {
            title: 'Gestion de la Galerie',
            themes,
            isAuthenticated: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('Erreur lors du chargement de la galerie admin:', error);
        res.status(500).render('pages/error', {
            title: 'Erreur',
            message: 'Erreur lors du chargement de la galerie',
            isAuthenticated: true,
            user: req.session.user
        });
    }
};

// Créer un nouveau thème
const createTheme = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Le nom du thème est requis' });
        }

        const theme = await prisma.galleryTheme.create({
            data: {
                name,
                description: description || ''
            }
        });

        res.json({ success: true, theme });
    } catch (error) {
        console.error('Erreur lors de la création du thème:', error);
        res.status(500).json({ error: 'Erreur lors de la création du thème' });
    }
};

// Uploader des médias
const uploadMedia = async (req, res) => {
    try {
        const { themeId, title, description } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier sélectionné' });
        }

        if (!themeId) {
            return res.status(400).json({ error: 'Thème requis' });
        }

        // Vérifier que le thème existe
        const theme = await prisma.galleryTheme.findUnique({
            where: { id: parseInt(themeId) }
        });

        if (!theme) {
            return res.status(404).json({ error: 'Thème non trouvé' });
        }

        const mediaPromises = files.map(file => {
            const isVideo = file.mimetype.startsWith('video/');

            return prisma.galleryMedia.create({
                data: {
                    titre: title || file.originalname,
                    description: description || '',
                    filename: file.filename,
                    originalUrl: `/uploads/gallery/${file.filename}`,
                    type: isVideo ? 'VIDEO' : 'IMAGE',
                    themeId: parseInt(themeId),
                    auteurId: req.session.user.id
                }
            });
        });

        const media = await Promise.all(mediaPromises);

        res.json({ success: true, media });
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
};

// Supprimer un média
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await prisma.galleryMedia.findUnique({
            where: { id: parseInt(id) }
        });

        if (!media) {
            return res.status(404).json({ error: 'Média non trouvé' });
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, '../../uploads/gallery', media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer de la base de données
        await prisma.galleryMedia.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

// Supprimer un thème
const deleteTheme = async (req, res) => {
    try {
        const { id } = req.params;

        // Récupérer tous les médias du thème pour supprimer les fichiers
        const theme = await prisma.galleryTheme.findUnique({
            where: { id: parseInt(id) },
            include: { medias: true }
        });

        if (!theme) {
            return res.status(404).json({ error: 'Thème non trouvé' });
        }

        // Supprimer les fichiers physiques
        theme.medias.forEach(media => {
            const filePath = path.join(__dirname, '../../uploads/gallery', media.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // Supprimer le thème (cascade supprimera les médias)
        await prisma.galleryTheme.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du thème:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du thème' });
    }
};

module.exports = {
    upload,
    showGallery,
    showAdminGallery,
    createTheme,
    uploadMedia,
    deleteMedia,
    deleteTheme
};
