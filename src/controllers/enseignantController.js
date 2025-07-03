const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const enseignantController = {
  // === TABLEAU DE BORD ENSEIGNANT ===
  async getDashboard(req, res) {
    try {
      const enseignantId = req.session.user.id;
      
      const mesClasses = await prisma.classe.findMany({
        where: { enseignantId },
        include: {
          eleves: true,
          _count: {
            select: {
              eleves: true,
              horaires: true,
              notes: true
            }
          }
        }
      });

      const mesHoraires = await prisma.horaire.findMany({
        where: { enseignantId },
        include: {
          classe: {
            select: { nom: true }
          }
        },
        orderBy: [
          { jourSemaine: 'asc' },
          { heureDebut: 'asc' }
        ]
      });

      const actualites = await prisma.actualite.findMany({
        where: { visible: true },
        take: 3,
        orderBy: { datePublication: 'desc' },
        include: {
          auteur: {
            select: { firstName: true, lastName: true }
          }
        }
      });

      // Horaires du jour
      const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
      const horairesDuJour = mesHoraires.filter(h => 
        h.jourSemaine.toLowerCase() === aujourdhui.toLowerCase()
      );
      
      res.render('pages/enseignant/dashboard', { 
        mesClasses,
        horairesDuJour,
        actualites,
        title: 'Espace Enseignant'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard enseignant:', error);
      res.status(500).render('pages/error', { 
        message: 'Erreur lors de la récupération de votre espace' 
      });
    }
  },

  // === GESTION DES NOTES ===
  async getNotesManagement(req, res) {
    try {
      const enseignantId = req.session.user.id;
      const { classeId } = req.query;
      
      const mesClasses = await prisma.classe.findMany({
        where: { enseignantId },
        include: {
          eleves: {
            orderBy: { lastName: 'asc' }
          }
        }
      });

      let notes = [];
      let classeSelectionnee = null;
      
      if (classeId) {
        classeSelectionnee = await prisma.classe.findFirst({
          where: { 
            id: parseInt(classeId),
            enseignantId
          },
          include: {
            eleves: {
              orderBy: { lastName: 'asc' }
            }
          }
        });

        if (classeSelectionnee) {
          notes = await prisma.note.findMany({
            where: { 
              classeId: parseInt(classeId),
              enseignantId
            },
            include: {
              eleve: {
                select: { firstName: true, lastName: true }
              }
            },
            orderBy: { dateEvaluation: 'desc' }
          });
        }
      }
      
      res.render('pages/enseignant/notes', { 
        mesClasses,
        classeSelectionnee,
        notes,
        title: 'Gestion des notes'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      res.status(500).render('pages/error', { 
        message: 'Erreur lors de la récupération des notes' 
      });
    }
  },

  async createNote(req, res) {
    try {
      const { eleveId, classeId, matiere, note, coefficient, commentaire, dateEvaluation } = req.body;
      const enseignantId = req.session.user.id;
      
      const nouvelleNote = await prisma.note.create({
        data: {
          eleveId: parseInt(eleveId),
          classeId: parseInt(classeId),
          enseignantId,
          matiere,
          note: parseFloat(note),
          coefficient: parseFloat(coefficient) || 1,
          commentaire: commentaire || null,
          dateEvaluation: new Date(dateEvaluation)
        }
      });
      
      res.json({ 
        success: true, 
        message: 'Note ajoutée avec succès',
        note: nouvelleNote
      });
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'ajout de la note' 
      });
    }
  },

  // === GESTION DES ABSENCES ===
  async getAbsencesManagement(req, res) {
    try {
      const enseignantId = req.session.user.id;
      const { classeId } = req.query;
      
      const mesClasses = await prisma.classe.findMany({
        where: { enseignantId },
        include: {
          eleves: {
            orderBy: { lastName: 'asc' }
          }
        }
      });

      let absences = [];
      let classeSelectionnee = null;
      
      if (classeId) {
        classeSelectionnee = await prisma.classe.findFirst({
          where: { 
            id: parseInt(classeId),
            enseignantId
          },
          include: {
            eleves: {
              orderBy: { lastName: 'asc' }
            }
          }
        });

        if (classeSelectionnee) {
          absences = await prisma.absence.findMany({
            where: { 
              classeId: parseInt(classeId)
            },
            include: {
              eleve: {
                select: { firstName: true, lastName: true }
              }
            },
            orderBy: { dateDebut: 'desc' }
          });
        }
      }
      
      res.render('pages/enseignant/absences', { 
        mesClasses,
        classeSelectionnee,
        absences,
        title: 'Gestion des absences'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des absences:', error);
      res.status(500).render('pages/error', { 
        message: 'Erreur lors de la récupération des absences' 
      });
    }
  },

  async createAbsence(req, res) {
    try {
      const { eleveId, classeId, dateDebut, dateFin, motif, justifiee, commentaire } = req.body;
      
      const nouvelleAbsence = await prisma.absence.create({
        data: {
          eleveId: parseInt(eleveId),
          classeId: parseInt(classeId),
          dateDebut: new Date(dateDebut),
          dateFin: dateFin ? new Date(dateFin) : null,
          motif,
          justifiee: justifiee === 'true',
          commentaire: commentaire || null
        }
      });
      
      res.json({ 
        success: true, 
        message: 'Absence enregistrée avec succès',
        absence: nouvelleAbsence
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'absence:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'enregistrement de l\'absence' 
      });
    }
  },

  // === HORAIRES ===
  async getHoraires(req, res) {
    try {
      const enseignantId = req.session.user.id;
      
      const mesHoraires = await prisma.horaire.findMany({
        where: { enseignantId },
        include: {
          classe: {
            select: { nom: true, niveau: true }
          }
        },
        orderBy: [
          { jourSemaine: 'asc' },
          { heureDebut: 'asc' }
        ]
      });

      // Organiser les horaires par jour
      const joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const horairesParJour = {};
      
      joursOrdre.forEach(jour => {
        horairesParJour[jour] = mesHoraires.filter(h => h.jourSemaine === jour);
      });
      
      res.render('pages/enseignant/horaires', { 
        horairesParJour,
        joursOrdre,
        title: 'Mes horaires'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires:', error);
      res.status(500).render('pages/error', { 
        message: 'Erreur lors de la récupération des horaires' 
      });
    }
  },

  // === MESSAGERIE ===
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

      // Liste des parents pour l'envoi de messages
      const parents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        select: { id: true, firstName: true, lastName: true }
      });

      // Marquer les messages comme lus
      await prisma.message.updateMany({
        where: { 
          destinataireId: userId,
          lu: false 
        },
        data: { lu: true }
      });
      
      res.render('pages/enseignant/messages', { 
        messages,
        parents,
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

module.exports = enseignantController;
