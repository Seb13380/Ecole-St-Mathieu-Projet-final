const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const actualiteController = {
  // === AFFICHAGE DES ACTUALITÉS ===
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

  // === GESTION DES ACTUALITÉS (ADMIN/DIRECTION) ===
  async getActualitesManagement(req, res) {
    try {
      const actualites = await prisma.actualite.findMany({
        include: {
          auteur: {
            select: { firstName: true, lastName: true, role: true }
          }
        },
        orderBy: { datePublication: 'desc' }
      });
      
      res.render('pages/admin/actualites', { 
        actualites,
        title: 'Gestion des actualités'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des actualités:', error);
      res.status(500).render('pages/error', { 
        message: 'Erreur lors de la récupération des actualités' 
      });
    }
  },

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
