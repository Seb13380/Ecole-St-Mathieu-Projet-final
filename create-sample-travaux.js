const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleTravaux() {
    try {
        // Récupérer des utilisateurs avec le rôle DIRECTION ou ADMIN pour attribuer les travaux
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE']
                }
            }
        });

        if (users.length === 0) {
            console.log('❌ Aucun utilisateur DIRECTION, ADMIN ou MAINTENANCE_SITE trouvé');
            return;
        }

        const lionel = users.find(u => u.firstName.toLowerCase().includes('lionel')) || users[0];
        const frank = users.find(u => u.firstName.toLowerCase().includes('frank')) || users[0];

        console.log('🏗️  Création de travaux d\'exemple...');

        const travaux = [
            {
                titre: 'Rénovation de la cour de récréation',
                description: 'Réfection complète du sol de la cour avec nouveau revêtement antidérapant et marquages au sol.',
                dateDebut: new Date('2024-09-01'),
                dateFin: new Date('2024-10-15'),
                progression: 75,
                statut: 'EN_COURS',
                important: true,
                visible: true,
                auteurId: lionel.id
            },
            {
                titre: 'Installation équipements informatiques',
                description: 'Mise en place de tableaux numériques et ordinateurs portables dans les classes.',
                dateDebut: new Date('2024-08-15'),
                dateFin: new Date('2024-09-30'),
                progression: 100,
                statut: 'TERMINE',
                important: false,
                visible: true,
                auteurId: frank.id
            },
            {
                titre: 'Réfection de la toiture',
                description: 'Travaux de réfection complète de la toiture pour améliorer l\'isolation thermique.',
                dateDebut: new Date('2024-06-01'),
                dateFin: new Date('2024-07-31'),
                progression: 100,
                statut: 'TERMINE',
                important: true,
                visible: false, // Masqué car terminé
                auteurId: lionel.id
            },
            {
                titre: 'Création jardin pédagogique',
                description: 'Aménagement d\'un espace vert pour activités pédagogiques avec bacs et système d\'arrosage.',
                dateDebut: new Date('2024-10-01'),
                dateFin: new Date('2024-11-30'),
                progression: 25,
                statut: 'EN_COURS',
                important: false,
                visible: true,
                auteurId: frank.id
            },
            {
                titre: 'Mise aux normes sécurité incendie',
                description: 'Installation de détecteurs de fumée et mise à jour du système d\'alarme incendie.',
                dateDebut: new Date('2024-11-15'),
                dateFin: new Date('2024-12-20'),
                progression: 0,
                statut: 'PLANIFIE',
                important: true,
                visible: true,
                auteurId: lionel.id
            },
            {
                titre: 'Réparation chauffage bâtiment annexe',
                description: 'Intervention d\'urgence pour réparer le système de chauffage défaillant.',
                dateDebut: new Date('2024-09-10'),
                dateFin: new Date('2024-09-25'),
                progression: 0,
                statut: 'SUSPENDU',
                important: true,
                visible: true,
                auteurId: frank.id
            }
        ];

        for (const travauxData of travaux) {
            const travail = await prisma.travaux.create({
                data: travauxData,
                include: {
                    auteur: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });

            console.log(`✅ Travaux créés: "${travail.titre}" (${travail.statut}, ${travail.progression}%)`);
        }

        console.log(`\n🎉 ${travaux.length} travaux d'exemple créés avec succès!`);

        // Afficher un résumé
        const totalTravaux = await prisma.travaux.count();
        const travauxVisibles = await prisma.travaux.count({ where: { visible: true } });
        const travauxImportants = await prisma.travaux.count({ where: { important: true, visible: true } });
        const travauxEnCours = await prisma.travaux.count({ where: { statut: 'EN_COURS' } });

        console.log('\n📊 Résumé des travaux:');
        console.log(`• Total: ${totalTravaux} travaux`);
        console.log(`• Visibles: ${travauxVisibles} travaux`);
        console.log(`• Importants: ${travauxImportants} travaux`);
        console.log(`• En cours: ${travauxEnCours} travaux`);

    } catch (error) {
        console.error('❌ Erreur lors de la création des travaux d\'exemple:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createSampleTravaux();
