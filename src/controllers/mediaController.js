const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/assets/images');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique avec timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = path.extname(file.originalname);
        const uniqueName = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
        cb(null, uniqueName);
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers images sont autorisés (JPEG, PNG, GIF, WebP)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

const mediaController = {
    // Middleware d'upload
    uploadMiddleware: upload.array('images', 10), // Permet d'uploader jusqu'à 10 images

    // Afficher la page de gestion des médias
    getMediaManagement: async (req, res) => {
        try {
            console.log('📸 Accès à la gestion des médias');
            console.log('👤 Utilisateur:', req.session.user?.email, 'Rôle:', req.session.user?.role);

            // Lire le dossier des images
            const imagesPath = path.join(__dirname, '../../public/assets/images');
            let images = [];

            try {
                const files = fs.readdirSync(imagesPath);
                images = files
                    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                    .map(file => {
                        const filePath = path.join(imagesPath, file);
                        const stats = fs.statSync(filePath);
                        return {
                            filename: file,
                            url: `/assets/images/${file}`,
                            size: stats.size,
                            uploadDate: stats.birthtime
                        };
                    })
                    .sort((a, b) => b.uploadDate - a.uploadDate);
            } catch (error) {
                console.error('Erreur lors de la lecture du dossier images:', error);
            }

            res.render('pages/media/management', {
                title: 'Gestion des Médias',
                images: images,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des médias:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des médias'
            });
        }
    },

    // Upload de nouvelles images
    uploadImages: async (req, res) => {
        try {
            console.log('📸 Upload de nouvelles images');
            console.log('📁 Fichiers reçus:', req.files?.length || 0);

            if (!req.files || req.files.length === 0) {
                return res.redirect('/admin/media?error=Aucun fichier sélectionné');
            }

            console.log('🎉 Images uploadées avec succès:', req.files.map(f => f.filename));
            res.redirect('/admin/media?success=' + encodeURIComponent(`${req.files.length} image(s) uploadée(s) avec succès`));

        } catch (error) {
            console.error('❌ Erreur lors de l\'upload:', error);

            // Supprimer les fichiers uploadés en cas d'erreur
            if (req.files) {
                req.files.forEach(file => {
                    const filePath = path.join(__dirname, '../../public/assets/images', file.filename);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Erreur lors de la suppression du fichier:', err);
                    });
                });
            }

            res.redirect('/admin/media?error=Erreur lors de l\'upload des images');
        }
    },

    // Supprimer une image
    deleteImage: async (req, res) => {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../../public/assets/images', filename);

            // Vérifier que le fichier existe
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, error: 'Fichier non trouvé' });
            }

            // Supprimer le fichier
            fs.unlinkSync(filePath);

            console.log('🗑️ Image supprimée:', filename);
            res.json({ success: true });

        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'image:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Obtenir les informations d'une image
    getImageInfo: async (req, res) => {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../../public/assets/images', filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, error: 'Fichier non trouvé' });
            }

            const stats = fs.statSync(filePath);
            const imageInfo = {
                filename: filename,
                url: `/assets/images/${filename}`,
                size: stats.size,
                uploadDate: stats.birthtime,
                sizeFormatted: formatFileSize(stats.size)
            };

            res.json({ success: true, image: imageInfo });

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des infos:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

// Fonction utilitaire pour formater la taille des fichiers
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = mediaController;
