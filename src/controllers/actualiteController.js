const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ACTUALITES_PERMISSIONS = require('../permissions/actualites-permissions');

const prisma = new PrismaClient();

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads/actualites');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Images et documents autorisés
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé !'));
    }
  }
});

// Fonction pour vérifier les permissions
function hasPermission(userRole, action) {
  const permissions = ACTUALITES_PERMISSIONS[userRole];
  return permissions && permissions[action] === true;
}

const actualiteController = {
  async getActualites(req, res) {
    try {
      const actualites = await prisma.actualite.findMany({
        where: { visible: true },
        include: {
          auteur: {
            select: { firstName: true, lastName: true, role: true }
          }
        },
        orderBy: [
          { important: 'desc' },
          { datePublication: 'desc' }
        ]
      });

      res.render('pages/actualites', {
        actualites,
        title: 'Actualités de l\'école'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération des actualités'
      });
    }
  },

  async getActualitesManagement(req, res) {
    try {
      // Vérifier les permissions
      if (!hasPermission(req.user.role, 'create') && !hasPermission(req.user.role, 'access_all')) {
        return res.status(403).render('pages/error', {
          message: 'Accès non autorisé'
        });
      }

      const actualites = await prisma.actualite.findMany({
        include: {
          auteur: {
            select: { firstName: true, lastName: true, role: true }
          }
        },
        orderBy: { datePublication: 'desc' }
      });

      res.render('pages/admin/gestion-actualites', {
        actualites,
        title: 'Gestion des actualités',
        user: req.user,
        hasPermission: hasPermission,
        canEdit: (user, actualite) => {
          if (hasPermission(user.role, 'access_all')) return true;
          return actualite.auteurId === user.id && hasPermission(user.role, 'edit');
        },
        canDelete: (user, actualite) => {
          if (hasPermission(user.role, 'access_all')) return true;
          return actualite.auteurId === user.id && hasPermission(user.role, 'delete');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération des actualités'
      });
    }
  },

  // Nouvelle méthode pour créer une actualité avec upload
  async createActualiteWithUpload(req, res) {
    try {
      // Vérifier les permissions
      if (!hasPermission(req.user.role, 'create')) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const { titre, contenu, important, visible } = req.body;

      // Traitement de l'image principale
      let imageUrl = null;
      if (req.files && req.files.image && req.files.image[0]) {
        imageUrl = `/uploads/actualites/${req.files.image[0].filename}`;
      }

      // Traitement des documents joints
      let documentsUrls = [];
      if (req.files && req.files.documents) {
        documentsUrls = req.files.documents.map(file => ({
          name: file.originalname,
          url: `/uploads/actualites/${file.filename}`,
          type: path.extname(file.originalname).toLowerCase()
        }));
      }

      const actualite = await prisma.actualite.create({
        data: {
          titre,
          contenu,
          auteurId: req.user.id,
          important: important === 'true',
          visible: visible === 'true',
          imageUrl,
          documentsUrls: JSON.stringify(documentsUrls)
        }
      });

      res.status(201).json({
        success: true,
        actualite,
        message: 'Actualité créée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'actualité:', error);
      res.status(500).json({
        error: 'Erreur lors de la création de l\'actualité'
      });
    }
  },

  // Middleware d'upload pour les actualités
  uploadMiddleware: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]),

  async createActualite(req, res) {
    try {
      const { titre, contenu, important, visible } = req.body;
      const auteurId = req.session.user.id;

      const actualite = await prisma.actualite.create({
        data: {
          titre,
          contenu,
          auteurId,
          important: important === 'true',
          visible: visible !== 'false' // visible par défaut
        }
      });

      res.json({
        success: true,
        message: 'Actualité créée avec succès',
        actualite
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'actualité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'actualité'
      });
    }
  },

  async updateActualite(req, res) {
    try {
      const { id } = req.params;
      const { titre, contenu, important, visible } = req.body;

      const actualite = await prisma.actualite.update({
        where: { id: parseInt(id) },
        data: {
          titre,
          contenu,
          important: important === 'true',
          visible: visible === 'true'
        }
      });

      res.json({
        success: true,
        message: 'Actualité mise à jour avec succès',
        actualite
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'actualité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'actualité'
      });
    }
  },

  async deleteActualite(req, res) {
    try {
      const { id } = req.params;

      await prisma.actualite.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Actualité supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'actualité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'actualité'
      });
    }
  },

  async toggleVisibility(req, res) {
    try {
      const { id } = req.params;

      const actualite = await prisma.actualite.findUnique({
        where: { id: parseInt(id) }
      });

      if (!actualite) {
        return res.status(404).json({
          success: false,
          message: 'Actualité non trouvée'
        });
      }

      const updatedActualite = await prisma.actualite.update({
        where: { id: parseInt(id) },
        data: { visible: !actualite.visible }
      });

      res.json({
        success: true,
        message: `Actualité ${updatedActualite.visible ? 'rendue visible' : 'masquée'}`,
        actualite: updatedActualite
      });
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du changement de visibilité'
      });
    }
  }
};

module.exports = actualiteController;
