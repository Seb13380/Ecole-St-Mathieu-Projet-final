const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads/actualites s'il n'existe pas
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'actualites');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Génère un nom unique avec timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'actualite-' + uniqueSuffix + extension);
    }
});

// Filtre pour accepter seulement images et vidéos
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Utilisez des images (JPEG, PNG, GIF, WebP) ou des vidéos (MP4, WebM, OGG).'), false);
    }
};

// Configuration multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    }
});

module.exports = upload;
