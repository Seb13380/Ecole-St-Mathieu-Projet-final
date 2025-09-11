const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBasicClasses() {
    try {
        console.log('🏫 Création des classes de base...');

        // Créer les classes de base
        const classes = [
            { nom: 'PS', niveau: 'Maternelle', anneeScolaire: '2025-2026' },
            { nom: 'MS', niveau: 'Maternelle', anneeScolaire: '2025-2026' },
            { nom: 'GS', niveau: 'Maternelle', anneeScolaire: '2025-2026' },
            { nom: 'CP', niveau: 'Élémentaire', anneeScolaire: '2025-2026' },
            { nom: 'CE1', niveau: 'Élémentaire', anneeScolaire: '2025-2026' },
            { nom: 'CE2', niveau: 'Élémentaire', anneeScolaire: '2025-2026' },
            { nom: 'CM1', niveau: 'Élémentaire', anneeScolaire: '2025-2026' },
            { nom: 'CM2', niveau: 'Élémentaire', anneeScolaire: '2025-2026' }
        ];

        for (const classeData of classes) {
            const classe = await prisma.classe.upsert({
                where: { nom: classeData.nom },
                update: {},
                create: classeData
            });
            console.log(`✅ Classe créée: ${classe.nom} (ID: ${classe.id})`);
        }

        console.log('🎉 Classes créées avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createBasicClasses();
