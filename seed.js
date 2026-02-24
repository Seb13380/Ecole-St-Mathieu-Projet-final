const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Initialisation des données de test...');

    // Créer un utilisateur admin principal (Sébastien)
    const mainAdminPassword = await bcrypt.hash('Seb&paul3726', 10);
    const mainAdmin = await prisma.user.upsert({
      where: { email: 'sgdigitalweb13@gmail.com' },
      update: {
        password: mainAdminPassword // Mettre à jour le mot de passe si le compte existe
      },
      create: {
        firstName: 'Sébastien',
        lastName: 'Ceccarelli',
        email: 'sgdigitalweb13@gmail.com',
        password: mainAdminPassword,
        phone: '06.00.00.00.00',
        adress: 'Marseille',
        role: 'ADMIN'
      }
    });
    console.log('✅ Compte admin principal créé/mis à jour:', mainAdmin.email);

    // Créer un utilisateur admin de test
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@stmathieu.fr' },
      update: {},
      create: {
        firstName: 'Sébastien',
        lastName: 'Admin',
        email: 'admin@stmathieu.fr',
        password: adminPassword,
        phone: '01.23.45.67.89',
        adress: '123 Rue de l\'École',
        role: 'ADMIN'
      }
    });
    console.log('✅ Compte admin test créé:', admin.email);

    // Créer un directeur
    const directionPassword = await bcrypt.hash('direction123', 10);
    const direction = await prisma.user.upsert({
      where: { email: 'direction@stmathieu.fr' },
      update: {},
      create: {
        firstName: 'Marie',
        lastName: 'Directrice',
        email: 'direction@stmathieu.fr',
        password: directionPassword,
        phone: '01.23.45.67.90',
        adress: '456 Avenue de la Direction',
        role: 'DIRECTION'
      }
    });

    // Créer des enseignants
    const enseignant1Password = await bcrypt.hash('enseign123', 10);
    const enseignant1 = await prisma.user.upsert({
      where: { email: 'marie.martin@stmathieu.fr' },
      update: {},
      create: {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@stmathieu.fr',
        password: enseignant1Password,
        phone: '01.23.45.67.91',
        adress: '789 Rue des Enseignants',
        role: 'ENSEIGNANT'
      }
    });

    const enseignant2Password = await bcrypt.hash('enseign123', 10);
    const enseignant2 = await prisma.user.upsert({
      where: { email: 'pierre.dupont@stmathieu.fr' },
      update: {},
      create: {
        firstName: 'Pierre',
        lastName: 'Dupont',
        email: 'pierre.dupont@stmathieu.fr',
        password: enseignant2Password,
        phone: '01.23.45.67.92',
        adress: '321 Boulevard de l\'Éducation',
        role: 'ENSEIGNANT'
      }
    });

    // Créer des parents
    const parent1Password = await bcrypt.hash('parent123', 10);
    const parent1 = await prisma.user.upsert({
      where: { email: 'sophie.bernard@email.fr' },
      update: {},
      create: {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@email.fr',
        password: parent1Password,
        phone: '06.12.34.56.78',
        adress: '15 Rue des Familles',
        role: 'PARENT'
      }
    });

    const parent2Password = await bcrypt.hash('parent123', 10);
    const parent2 = await prisma.user.upsert({
      where: { email: 'julien.moreau@email.fr' },
      update: {},
      create: {
        firstName: 'Julien',
        lastName: 'Moreau',
        email: 'julien.moreau@email.fr',
        password: parent2Password,
        phone: '06.98.76.54.32',
        adress: '28 Avenue des Parents',
        role: 'PARENT'
      }
    });

    // Créer des classes
    const cp = await prisma.classe.upsert({
      where: { nom: 'CP' },
      update: {},
      create: {
        nom: 'CP',
        niveau: 'Élémentaire',
        enseignantId: enseignant1.id,
        anneeScolaire: '2024-2025'
      }
    });

    const ce1 = await prisma.classe.upsert({
      where: { nom: 'CE1' },
      update: {},
      create: {
        nom: 'CE1',
        niveau: 'Élémentaire',
        enseignantId: enseignant2.id,
        anneeScolaire: '2024-2025'
      }
    });

    // Créer des élèves
    const eleve1 = await prisma.student.create({
      data: {
        firstName: 'Emma',
        lastName: 'Bernard',
        dateNaissance: new Date('2017-03-15'),
        classeId: cp.id,
        parentId: parent1.id
      }
    });

    const eleve2 = await prisma.student.create({
      data: {
        firstName: 'Lucas',
        lastName: 'Moreau',
        dateNaissance: new Date('2016-08-22'),
        classeId: ce1.id,
        parentId: parent2.id
      }
    });

    // Créer des horaires
    await prisma.horaire.create({
      data: {
        classeId: cp.id,
        enseignantId: enseignant1.id,
        jourSemaine: 'Lundi',
        heureDebut: '08:30',
        heureFin: '12:00',
        matiere: 'Français'
      }
    });

    await prisma.horaire.create({
      data: {
        classeId: cp.id,
        enseignantId: enseignant1.id,
        jourSemaine: 'Lundi',
        heureDebut: '14:00',
        heureFin: '16:30',
        matiere: 'Mathématiques'
      }
    });

    await prisma.horaire.create({
      data: {
        classeId: ce1.id,
        enseignantId: enseignant2.id,
        jourSemaine: 'Lundi',
        heureDebut: '08:30',
        heureFin: '12:00',
        matiere: 'Français'
      }
    });

    // Créer des notes
    await prisma.note.create({
      data: {
        eleveId: eleve1.id,
        classeId: cp.id,
        enseignantId: enseignant1.id,
        matiere: 'Français',
        note: 15.5,
        coefficient: 1,
        dateEvaluation: new Date('2024-06-15')
      }
    });

    await prisma.note.create({
      data: {
        eleveId: eleve1.id,
        classeId: cp.id,
        enseignantId: enseignant1.id,
        matiere: 'Mathématiques',
        note: 18,
        coefficient: 1,
        dateEvaluation: new Date('2024-06-20')
      }
    });

    await prisma.note.create({
      data: {
        eleveId: eleve2.id,
        classeId: ce1.id,
        enseignantId: enseignant2.id,
        matiere: 'Français',
        note: 16,
        coefficient: 1,
        dateEvaluation: new Date('2024-06-18')
      }
    });

    // Créer des actualités
    await prisma.actualite.create({
      data: {
        titre: 'Bienvenue à l\'École Saint-Mathieu !',
        contenu: 'Nous sommes ravis de vous accueillir dans notre établissement. Cette nouvelle plateforme vous permettra de suivre la scolarité de vos enfants et de rester informés des actualités de l\'école.',
        auteurId: direction.id,
        important: true,
        visible: true
      }
    });

    await prisma.actualite.create({
      data: {
        titre: 'Réunion de rentrée - Classes élémentaires',
        contenu: 'Les réunions de rentrée pour les classes élémentaires auront lieu la semaine prochaine. Les horaires et salles seront communiqués par les enseignants.',
        auteurId: enseignant1.id,
        important: false,
        visible: true
      }
    });

    await prisma.actualite.create({
      data: {
        titre: 'Sortie pédagogique au musée',
        contenu: 'Une sortie au musée d\'histoire naturelle est prévue pour les élèves de CE1 le mois prochain. Plus d\'informations suivront.',
        auteurId: enseignant2.id,
        important: false,
        visible: true
      }
    });

    // Créer des messages de contact
    await prisma.contact.create({
      data: {
        nom: 'François Leclerc',
        email: 'f.leclerc@email.fr',
        telephone: '06.11.22.33.44',
        sujet: 'Demande d\'information inscription',
        message: 'Bonjour, je souhaiterais avoir des informations concernant l\'inscription de mon fils en CP pour la rentrée prochaine.',
        traite: false
      }
    });

    await prisma.contact.create({
      data: {
        nom: 'Amélie Rousseau',
        email: 'a.rousseau@email.fr',
        sujet: 'Question sur la cantine',
        message: 'Bonjour, pourriez-vous me renseigner sur les modalités d\'inscription à la cantine scolaire ?',
        traite: true
      }
    });

    console.log('✅ Données de test initialisées avec succès !');
    console.log('\n📧 Comptes de test créés :');
    console.log('👑 Admin: admin@stmathieu.fr / admin123');
    console.log('🏢 Direction: direction@stmathieu.fr / direction123');
    console.log('👩‍🏫 Enseignante: marie.martin@stmathieu.fr / enseign123');
    console.log('👨‍🏫 Enseignant: pierre.dupont@stmathieu.fr / enseign123');
    console.log('👪 Parent 1: sophie.bernard@email.fr / parent123');
    console.log('👪 Parent 2: julien.moreau@email.fr / parent123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
