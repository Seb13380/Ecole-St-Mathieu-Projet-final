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
        // Accepter images et vidÃ©os
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image et vidÃ©o sont autorisÃ©s'));
        }
    }
});

// Afficher la galerie publique
const showGallery = async (req, res) => {
    try {
        // RÃ©cupÃ©rer tous les thÃ¨mes avec leurs mÃ©dias
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
            title: 'Images et VidÃ©os',
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
        console.log('====');

        // RÃ©cupÃ©rer tous les thÃ¨mes avec leurs mÃ©dias - TRIÉS PAR ORDRE
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
            orderBy: [
                { ordre: "asc" },  // D'abord par ordre personnalisé
                { name: "asc" }    // Puis par nom si même ordre
            ]
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

// CrÃ©er un nouveau thÃ¨me
const createTheme = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Le nom du thÃ¨me est requis' });
        }

        const theme = await prisma.galleryTheme.create({
            data: {
                name,
                description: description || ''
            }
        });

        res.json({ success: true, theme });
    } catch (error) {
        console.error('Erreur lors de la crÃ©ation du thÃ¨me:', error);
        res.status(500).json({ error: 'Erreur lors de la crÃ©ation du thÃ¨me' });
    }
};

// Uploader des mÃ©dias
const uploadMedia = async (req, res) => {
    try {
        const { themeId, title, description } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Aucun fichier sÃ©lectionnÃ©' });
        }

        if (!themeId) {
            return res.status(400).json({ error: 'ThÃ¨me requis' });
        }

        // VÃ©rifier que le thÃ¨me existe
        const theme = await prisma.galleryTheme.findUnique({
            where: { id: parseInt(themeId) }
        });

        if (!theme) {
            return res.status(404).json({ error: 'ThÃ¨me non trouvÃ©' });
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

// Supprimer un mÃ©dia
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await prisma.galleryMedia.findUnique({
            where: { id: parseInt(id) }
        });

        if (!media) {
            return res.status(404).json({ error: 'MÃ©dia non trouvÃ©' });
        }

        // Supprimer le fichier physique
        const filePath = path.join(__dirname, '../../uploads/gallery', media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer de la base de donnÃ©es
        await prisma.galleryMedia.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

// Supprimer un thÃ¨me
const deleteTheme = async (req, res) => {
    try {
        const { id } = req.params;

        // RÃ©cupÃ©rer tous les mÃ©dias du thÃ¨me pour supprimer les fichiers
        const theme = await prisma.galleryTheme.findUnique({
            where: { id: parseInt(id) },
            include: { medias: true }
        });

        if (!theme) {
            return res.status(404).json({ error: 'ThÃ¨me non trouvÃ©' });
        }

        // Supprimer les fichiers physiques
        theme.medias.forEach(media => {
            const filePath = path.join(__dirname, '../../uploads/gallery', media.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // Supprimer le thÃ¨me (cascade supprimera les mÃ©dias)
        await prisma.galleryTheme.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du thÃ¨me:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du thÃ¨me' });
    }
};

// 🆕 NOUVELLE FONCTION - Réorganiser les thèmes
const reorderThemes = async (req, res) => {
    try {
        const { themeIds } = req.body;

        if (!Array.isArray(themeIds)) {
            return res.status(400).json({ error: 'Format invalide - tableau requis' });
        }

        console.log('🔄 Réorganisation des thèmes:', themeIds);

        // Mettre à jour l'ordre de chaque thème
        const updatePromises = themeIds.map((themeId, index) => {
            return prisma.galleryTheme.update({
                where: { id: parseInt(themeId) },
                data: { ordre: index + 1 }
            });
        });

        await Promise.all(updatePromises);

        console.log('✅ Ordre des thèmes mis à jour');
        res.json({ success: true, message: 'Ordre mis à jour avec succès' });
    } catch (error) {
        console.error('❌ Erreur lors de la réorganisation:', error);
        res.status(500).json({ error: 'Erreur lors de la réorganisation' });
    }
};

// 🆕 Mettre à jour l'ordre d'un thème
const updateThemeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { ordre } = req.body;

        if (!ordre || ordre < 1) {
            return res.status(400).json({ error: 'Ordre invalide' });
        }

        console.log(`📊 Mise à jour ordre thème ${id} -> ${ordre}`);

        await prisma.galleryTheme.update({
            where: { id: parseInt(id) },
            data: { ordre: parseInt(ordre) }
        });

        res.json({ success: true, message: 'Ordre mis à jour' });
    } catch (error) {
        console.error('❌ Erreur mise à jour ordre thème:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

// 🆕 Mettre à jour l'ordre d'un média
const updateMediaOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { ordre } = req.body;

        if (!ordre || ordre < 1) {
            return res.status(400).json({ error: 'Ordre invalide' });
        }

        console.log(`📊 Mise à jour ordre média ${id} -> ${ordre}`);

        await prisma.galleryMedia.update({
            where: { id: parseInt(id) },
            data: { ordre: parseInt(ordre) }
        });

        res.json({ success: true, message: 'Ordre du média mis à jour' });
    } catch (error) {
        console.error('❌ Erreur mise à jour ordre média:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

module.exports = {
    upload,
    showGallery,
    showAdminGallery,
    createTheme,
    uploadMedia,
    deleteMedia,
    deleteTheme,
    reorderThemes,
    updateThemeOrder,
    updateMediaOrder
};

