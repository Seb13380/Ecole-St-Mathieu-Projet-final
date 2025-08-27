const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
      console.log('📝 Données reçues pour création:', req.body);
      console.log('📁 Fichier reçu:', req.file);

      const { titre, contenu, important, visible, datePublication } = req.body;
      const auteurId = req.session.user.id;

      // Gestion de la date de publication
      let datePublicationFinal = new Date();
      if (datePublication && datePublication.trim()) {
        datePublicationFinal = new Date(datePublication);
      }

      // Gestion du fichier média
      let mediaUrl = null;
      let mediaType = null;
      if (req.file) {
        mediaUrl = `/uploads/actualites/${req.file.filename}`;
        mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        console.log('📁 Média ajouté:', { mediaUrl, mediaType });
      }

      const actualite = await prisma.actualite.create({
        data: {
          titre,
          contenu,
          auteurId,
          mediaUrl,
          mediaType,
          important: important === 'true',
          visible: visible === 'true',
          datePublication: datePublicationFinal
        }
      });

      console.log('✅ Actualité créée:', actualite.titre);
      res.redirect('/actualites/manage?success=' + encodeURIComponent('Actualité créée avec succès'));
    } catch (error) {
      console.error('Erreur lors de la création de l\'actualité:', error);
      res.redirect('/actualites/manage?error=' + encodeURIComponent('Erreur lors de la création de l\'actualité'));
    }
  },

  async updateActualite(req, res) {
    try {
      console.log('🔧 updateActualite appelé:', {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body,
        file: req.file
      });

      const { id } = req.params;
      const { titre, contenu, important, visible } = req.body;

      // Préparer les données de mise à jour
      const updateData = {
        titre,
        contenu,
        important: important === 'true',
        visible: visible === 'true'
      };

      // Gestion du nouveau fichier média
      if (req.file) {
        updateData.mediaUrl = `/uploads/actualites/${req.file.filename}`;
        updateData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        console.log('📁 Nouveau média ajouté:', { mediaUrl: updateData.mediaUrl, mediaType: updateData.mediaType });
      }

      const actualite = await prisma.actualite.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      console.log('✅ Actualité mise à jour:', actualite.titre);
      res.redirect(`/actualites/manage?success=${encodeURIComponent('Actualité mise à jour avec succès')}#actualite-${id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'actualité:', error);
      res.redirect(`/actualites/manage?error=${encodeURIComponent('Erreur lors de la mise à jour de l\'actualité')}#actualite-${id || ''}`);
    }
  },

  async deleteActualite(req, res) {
    try {
      console.log('🗑️ deleteActualite appelé:', {
        method: req.method,
        params: req.params,
        body: req.body
      });

      const { id } = req.params;

      await prisma.actualite.delete({
        where: { id: parseInt(id) }
      });

      console.log('✅ Actualité supprimée:', id);
      res.redirect('/actualites/manage?success=' + encodeURIComponent('Actualité supprimée avec succès'));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'actualité:', error);
      res.redirect('/actualites/manage?error=' + encodeURIComponent('Erreur lors de la suppression de l\'actualité'));
    }
  },

  async toggleVisibility(req, res) {
    try {
      const { id } = req.params;

      const actualite = await prisma.actualite.findUnique({
        where: { id: parseInt(id) }
      });

      if (!actualite) {
        return res.redirect('/actualites/manage?error=' + encodeURIComponent('Actualité non trouvée'));
      }

      const updatedActualite = await prisma.actualite.update({
        where: { id: parseInt(id) },
        data: { visible: !actualite.visible }
      });

      const message = updatedActualite.visible ? 'Actualité rendue visible' : 'Actualité masquée';
      console.log('✅ Visibilité modifiée:', message);
      res.redirect(`/actualites/manage?success=${encodeURIComponent(message)}#actualite-${id}`);
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
      res.redirect(`/actualites/manage?error=${encodeURIComponent('Erreur lors du changement de visibilité')}#actualite-${id || ''}`);
    }
  }
};

module.exports = actualiteController;
