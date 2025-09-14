const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

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

      const { titre, contenu, important, visible, datePublication, lienUrl, lienTexte } = req.body;
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
          lienUrl: lienUrl && lienUrl.trim() ? lienUrl.trim() : null,
          lienTexte: lienTexte && lienTexte.trim() ? lienTexte.trim() : null,
          important: important === 'true',
          visible: visible === 'true',
          datePublication: datePublicationFinal
        },
        include: {
          auteur: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      console.log('✅ Actualité créée:', actualite.titre);

      // Envoyer des notifications par email aux parents si l'actualité est visible
      if (visible === 'true') {
        try {
          console.log('📧 Envoi des notifications aux parents...');

          // Récupérer tous les emails des parents
          const parents = await prisma.user.findMany({
            where: {
              role: 'PARENT'
            },
            select: { email: true }
          });

          const parentEmails = parents.map(parent => parent.email);

          if (parentEmails.length > 0) {
            const emailResult = await emailService.sendNewActualiteNotification({
              titre: actualite.titre,
              contenu: actualite.contenu,
              auteur: actualite.auteur,
              datePublication: actualite.datePublication,
              important: actualite.important,
              mediaUrl: actualite.mediaUrl
            }, parentEmails);

            if (emailResult.success) {
              console.log(`✅ Notifications envoyées à ${emailResult.recipientCount} parents`);
            } else {
              console.error('❌ Erreur lors de l\'envoi des notifications:', emailResult.error);
            }
          } else {
            console.log('ℹ️ Aucun parent trouvé pour les notifications');
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi des notifications par email:', emailError);
          // On continue même si l'email échoue
        }
      } else {
        console.log('ℹ️ Actualité non visible, aucune notification envoyée');
      }

      res.redirect('/actualites/manage?success=' + encodeURIComponent('Actualité créée avec succès'));
    } catch (error) {
      console.error('Erreur lors de la création de l\'actualité:', error);
      res.redirect('/actualites/manage?error=' + encodeURIComponent('Erreur lors de la création de l\'actualité'));
    }
  },

  async updateActualite(req, res) {
    const { id } = req.params; // Déplacer la déclaration ici pour être accessible dans catch

    try {
      console.log('🔧 updateActualite appelé:', {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body,
        file: req.file
      });

      const { titre, contenu, important, visible, lienUrl, lienTexte } = req.body;

      // Préparer les données de mise à jour
      const updateData = {
        titre,
        contenu,
        lienUrl: lienUrl && lienUrl.trim() ? lienUrl.trim() : null,
        lienTexte: lienTexte && lienTexte.trim() ? lienTexte.trim() : null,
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
        where: { id: parseInt(id) },
        include: {
          auteur: {
            select: { firstName: true, lastName: true }
          }
        }
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

      // Si l'actualité devient visible, envoyer des notifications aux parents
      if (updatedActualite.visible && !actualite.visible) {
        try {
          console.log('📧 Envoi des notifications aux parents pour actualité rendue visible...');

          // Récupérer tous les emails des parents
          const parents = await prisma.user.findMany({
            where: {
              role: 'PARENT'
            },
            select: { email: true }
          });

          const parentEmails = parents.map(parent => parent.email);

          if (parentEmails.length > 0) {
            const emailResult = await emailService.sendNewActualiteNotification({
              titre: actualite.titre,
              contenu: actualite.contenu,
              auteur: actualite.auteur,
              datePublication: actualite.datePublication,
              important: actualite.important,
              mediaUrl: actualite.mediaUrl
            }, parentEmails);

            if (emailResult.success) {
              console.log(`✅ Notifications envoyées à ${emailResult.recipientCount} parents`);
            } else {
              console.error('❌ Erreur lors de l\'envoi des notifications:', emailResult.error);
            }
          } else {
            console.log('ℹ️ Aucun parent trouvé pour les notifications');
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi des notifications par email:', emailError);
          // On continue même si l'email échoue
        }
      }

      res.redirect(`/actualites/manage?success=${encodeURIComponent(message)}#actualite-${id}`);
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
      res.redirect(`/actualites/manage?error=${encodeURIComponent('Erreur lors du changement de visibilité')}#actualite-${id || ''}`);
    }
  }
};

module.exports = actualiteController;
