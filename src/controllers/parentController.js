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
          },
          notes: {
            take: 5,
            orderBy: { dateEvaluation: 'desc' },
            select: { matiere: true, note: true, coefficient: true, dateEvaluation: true }
          },
          absences: {
            take: 5,
            orderBy: { dateDebut: 'desc' },
            select: { dateDebut: true, dateFin: true, motif: true, justifiee: true }
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
          },
          notes: {
            orderBy: { dateEvaluation: 'desc' },
            include: {
              enseignant: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          absences: {
            orderBy: { dateDebut: 'desc' }
          }
        }
      });

      const enfantsAvecMoyennes = enfants.map(enfant => {
        const moyennesParMatiere = {};
        
        enfant.notes.forEach(note => {
          if (!moyennesParMatiere[note.matiere]) {
            moyennesParMatiere[note.matiere] = {
              notes: [],
              total: 0,
              coefficientTotal: 0
            };
          }
          
          moyennesParMatiere[note.matiere].notes.push(note);
          moyennesParMatiere[note.matiere].total += note.note * note.coefficient;
          moyennesParMatiere[note.matiere].coefficientTotal += note.coefficient;
        });

        Object.keys(moyennesParMatiere).forEach(matiere => {
          const data = moyennesParMatiere[matiere];
          data.moyenne = data.coefficientTotal > 0 ? 
            (data.total / data.coefficientTotal).toFixed(2) : 0;
        });

        return {
          ...enfant,
          moyennesParMatiere
        };
      });
      
      res.render('pages/parent/suivi-scolaire', { 
        enfants: enfantsAvecMoyennes,
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
            include: {
              horaires: {
                include: {
                  enseignant: {
                    select: { firstName: true, lastName: true }
                  }
                },
                orderBy: [
                  { jourSemaine: 'asc' },
                  { heureDebut: 'asc' }
                ]
              }
            }
          }
        }
      });

      const joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      
      enfants.forEach(enfant => {
        const horairesParJour = {};
        joursOrdre.forEach(jour => {
          horairesParJour[jour] = enfant.classe.horaires.filter(h => h.jourSemaine === jour);
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
