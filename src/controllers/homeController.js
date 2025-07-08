const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const homeController = {
  getHome: (req, res) => {
    res.render('pages/home', {
      title: 'École Saint-Mathieu - Accueil',
      message: req.query.message || req.query.success || req.query.error
    });
  },

  getReglementInterieur: (req, res) => {
    res.render('pages/lecole/reglementinterieur', {
      title: 'École Saint-Mathieu - Règlement Intérieur'
    });
  },

  getFraisScolarite: (req, res) => {
    res.render('pages/lecole/fraisdescolarite', {
      title: 'École Saint-Mathieu - Frais de Scolarité'
    });
  },

  getHoraires: (req, res) => {
    res.render('pages/lecole/horaires', {
      title: 'École Saint-Mathieu - Horaires'
    });
  },

  async postContact(req, res) {
    try {
      const { name, email, message } = req.body;

      await prisma.contact.create({
        data: {
          nom: name,
          email,
          telephone: null,
          sujet: 'Contact depuis le site web',
          message
        }
      });

      console.log('Message de contact sauvegardé:', { name, email, message });

      res.redirect('/?message=Votre message a été envoyé avec succès. Nous vous recontacterons rapidement.');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de contact:', error);
      res.redirect('/?message=Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    }
  },

  async getContactMessages(req, res) {
    try {
      const messages = await prisma.contact.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.render('pages/admin/contact-messages', {
        messages,
        title: 'Messages de contact'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).render('pages/error', {
        message: 'Erreur lors de la récupération des messages'
      });
    }
  },

  async markContactAsProcessed(req, res) {
    try {
      const { id } = req.params;

      await prisma.contact.update({
        where: { id: parseInt(id) },
        data: { traite: true }
      });

      res.json({
        success: true,
        message: 'Message marqué comme traité'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du message'
      });
    }
  }
};



module.exports = homeController;

