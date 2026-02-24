const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads/documents s'il n'existe pas
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'documents');
console.log('📁 Dossier uploads/documents:', uploadsDir);

try {
    if (!fs.existsSync(uploadsDir)) {
        console.log('📂 Création du dossier uploads/documents...');
        fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        console.log('✅ Dossier créé avec succès');
    } else {
        console.log('✅ Dossier uploads/documents existe déjà');
        // Vérifier les permissions
        try {
            fs.accessSync(uploadsDir, fs.constants.W_OK);
            console.log('✅ Permissions d\'écriture OK');
        } catch (err) {
            console.error('❌ ERREUR: Pas de permissions d\'écriture sur', uploadsDir);
            console.error('Détails:', err.message);
        }
    }
} catch (error) {
    console.error('❌ ERREUR lors de la création du dossier uploads/documents:', error);
    console.error('Chemin:', uploadsDir);
    console.error('Erreur complète:', error);
}

// Configuration du storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📤 Tentative d\'upload dans:', uploadsDir);
        console.log('📄 Fichier:', file.originalname);

        // Vérifier à nouveau que le dossier existe et est accessible
        try {
            if (!fs.existsSync(uploadsDir)) {
                console.log('⚠️ Dossier manquant, création...');
                fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
            }
            fs.accessSync(uploadsDir, fs.constants.W_OK);
            console.log('✅ Destination accessible');
            cb(null, uploadsDir);
        } catch (error) {
            console.error('❌ ERREUR d\'accès au dossier de destination:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        try {
            // Génère un nom unique avec timestamp
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = 'document-' + uniqueSuffix + extension;
            console.log('📝 Nom de fichier généré:', filename);
            cb(null, filename);
        } catch (error) {
            console.error('❌ ERREUR lors de la génération du nom de fichier:', error);
            cb(error);
        }
    }
});

// Filtre pour accepter seulement les PDF et quelques formats de documents
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Utilisez des fichiers PDF, Word (.doc, .docx) ou texte (.txt).'), false);
    }
};

// Configuration multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

module.exports = upload;
