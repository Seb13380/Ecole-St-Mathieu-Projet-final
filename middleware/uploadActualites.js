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
        // Déterminer le dossier selon le type de fichier
        let uploadPath;

        if (file.mimetype.startsWith('image/')) {
            uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'actualites');
        } else if (file.mimetype.startsWith('video/')) {
            uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'actualites');
        } else if (file.mimetype === 'application/pdf') {
            uploadPath = path.join(__dirname, '..', 'public', 'assets', 'documents', 'actualites');
        } else {
            uploadPath = uploadsDir; // fallback
        }

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Génère un nom unique avec timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'actualite-' + uniqueSuffix + extension);
    }
});

// Filtre pour accepter images, vidéos et PDF
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'application/pdf'  // Support PDF ajouté
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Utilisez des images (JPEG, PNG, GIF, WebP), des vidéos (MP4, WebM, OGG) ou des documents PDF.'), false);
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
