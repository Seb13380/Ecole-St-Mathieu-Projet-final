// PERMISSIONS ACTUALITÉS PAR RÔLE

const ACTUALITES_PERMISSIONS = {
    // ✅ ACCÈS COMPLET (Créer, Modifier, Supprimer, Publier)
    ADMIN: {
        create: true,
        edit: true,
        delete: true,
        publish: true,
        upload_media: true,
        access_all: true
    },

    DIRECTION: {
        create: true,
        edit: true,
        delete: true,
        publish: true,
        upload_media: true,
        access_all: true // Peut voir toutes les actualités
    },

    // ✅ ACCÈS CRÉATION CONTENU
    ENSEIGNANT: {
        create: true,
        edit: true, // Seulement ses propres actualités
        delete: false, // Ne peut pas supprimer
        publish: false, // Doit être validé par direction
        upload_media: true,
        access_own: true // Seulement ses actualités
    },

    MAINTENANCE_SITE: {
        create: true,
        edit: true,
        delete: false,
        publish: true, // Peut publier le contenu site
        upload_media: true,
        access_all: true
    },

    // ❌ ACCÈS LECTURE SEULE
    SECRETAIRE_DIRECTION: {
        create: false,
        edit: false,
        delete: false,
        publish: false,
        upload_media: false,
        access_read: true // Lecture seule
    },

    RESTAURATION: {
        create: false,
        edit: false,
        delete: false,
        publish: false,
        upload_media: false,
        access_read: false // Pas d'accès
    },

    PARENT: {
        create: false,
        edit: false,
        delete: false,
        publish: false,
        upload_media: false,
        access_read: true // Lecture des actualités publiques
    }
};

module.exports = ACTUALITES_PERMISSIONS;
