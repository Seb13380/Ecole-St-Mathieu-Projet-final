const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const parentController = {
  async getDashboard(req, res) {
    try {
      const parentId = req.session.user.id;

      const enfants = await prisma.student.findMany({
        where: { parentId },
        include: {
          classe: {
            select: { nom: true, niveau: true }
          }
        }
      });

      const actualites = await prisma.actualite.findMany({
        where: { visible: true },
        take: 5,
        orderBy: { datePublication: 'desc' },
        include: {
          auteur: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      const messagesNonLus = await prisma.message.count({
        where: {
          destinataireId: parentId,
          lu: false
        }
      });

      res.render('pages/parent/dashboard', {
        enfants,
        actualites,
        messagesNonLus,
        title: 'Espace Parent'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard parent:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération de votre espace'
      });
    }
  },

  async getSuiviScolaire(req, res) {
    try {
      const parentId = req.session.user.id;
      const { eleveId } = req.params;

      let whereClause = { parentId };
      if (eleveId) {
        whereClause.id = parseInt(eleveId);
      }

      const enfants = await prisma.student.findMany({
        where: whereClause,
        include: {
          classe: {
            select: { nom: true, niveau: true }
          }
        }
      });

      // Pour l'instant, on affiche juste les infos de base des enfants
      // Les notes et absences peuvent être ajoutées plus tard quand les modèles existeront
      const enfantsAvecInfos = enfants.map(enfant => ({
        ...enfant,
        notes: [], // Placeholder pour les futures notes
        absences: [], // Placeholder pour les futures absences
        moyennesParMatiere: {} // Placeholder pour les futures moyennes
      }));

      res.render('pages/parent/suivi-scolaire', {
        enfants: enfantsAvecInfos,
        title: 'Suivi scolaire'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du suivi scolaire:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération du suivi scolaire'
      });
    }
  },

  async getHoraires(req, res) {
    try {
      const parentId = req.session.user.id;

      const enfants = await prisma.student.findMany({
        where: { parentId },
        include: {
          classe: {
            select: { nom: true, niveau: true }
          }
        }
      });

      // Pour l'instant, on affiche juste les infos de classe
      // Les horaires peuvent être ajoutés plus tard quand le modèle existera
      const joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

      enfants.forEach(enfant => {
        const horairesParJour = {};
        joursOrdre.forEach(jour => {
          horairesParJour[jour] = []; // Placeholder pour les futurs horaires
        });
        enfant.horairesParJour = horairesParJour;
      });

      res.render('pages/parent/horaires', {
        enfants,
        joursOrdre,
        title: 'Horaires des cours'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération des horaires'
      });
    }
  },

  async getMessages(req, res) {
    try {
      const userId = req.session.user.id;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { expediteurId: userId },
            { destinataireId: userId },
            { destinataireId: null } // Messages généraux
          ]
        },
        include: {
          expediteur: {
            select: { firstName: true, lastName: true, role: true }
          }
        },
        orderBy: { dateEnvoi: 'desc' }
      });

      await prisma.message.updateMany({
        where: {
          destinataireId: userId,
          lu: false
        },
        data: { lu: true }
      });

      res.render('pages/parent/messages', {
        messages,
        title: 'Messagerie'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération des messages'
      });
    }
  },

  async sendMessage(req, res) {
    try {
      const { destinataireId, sujet, contenu } = req.body;
      const expediteurId = req.session.user.id;

      const message = await prisma.message.create({
        data: {
          expediteurId,
          destinataireId: destinataireId ? parseInt(destinataireId) : null,
          sujet,
          contenu
        }
      });

      res.json({
        success: true,
        message: 'Message envoyé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du message'
      });
    }
  }
};

module.exports = parentController;
