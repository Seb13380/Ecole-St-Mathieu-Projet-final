const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createEssentialUsers() {
    try {
        console.log('👥 Création des utilisateurs essentiels...');

        // Hasher les mots de passe
        const hashLionel = await bcrypt.hash('lionel2024!', 12);
        const hashFrank = await bcrypt.hash('frank2024!', 12);

        // Créer Lionel (Directeur)
        const lionel = await prisma.user.create({
            data: {
                firstName: 'Lionel',
                lastName: 'Camboulives',
                email: 'l.camboulives@stmathieu.org',
                phone: '04.91.12.34.56',
                adress: 'École Saint-Mathieu',
                password: hashLionel,
                role: 'DIRECTION'
            }
        });
        console.log('✅ Lionel créé (DIRECTION)');

        // Créer Frank (avec rôle DIRECTION mais affichage gestionnaire)
        const frank = await prisma.user.create({
            data: {
                firstName: 'Frank',
                lastName: 'Quaracino',
                email: 'frank.quaracino@orange.fr',
                phone: '04.91.23.45.67',
                adress: 'École Saint-Mathieu',
                password: hashFrank,
                role: 'DIRECTION' // Même rôle que Lionel pour les permissions
            }
        });
        console.log('✅ Frank créé (DIRECTION)');

        // Créer quelques classes de test
        const classes = [
            { nom: 'PS', niveau: 'Petite Section', anneeScolaire: '2025-2026' },
            { nom: 'MS', niveau: 'Moyenne Section', anneeScolaire: '2025-2026' },
            { nom: 'GS', niveau: 'Grande Section', anneeScolaire: '2025-2026' },
            { nom: 'CP', niveau: 'Cours Préparatoire', anneeScolaire: '2025-2026' },
            { nom: 'CE1', niveau: 'Cours Élémentaire 1', anneeScolaire: '2025-2026' },
            { nom: 'CE2', niveau: 'Cours Élémentaire 2', anneeScolaire: '2025-2026' },
            { nom: 'CM1', niveau: 'Cours Moyen 1', anneeScolaire: '2025-2026' },
            { nom: 'CM2', niveau: 'Cours Moyen 2', anneeScolaire: '2025-2026' }
        ];

        for (const classeData of classes) {
            await prisma.classe.create({
                data: classeData
            });
        }
        console.log('✅ Classes créées');

        console.log('\n🎉 BASE DE DONNÉES PRÊTE !');
        console.log('🔑 Connexions:');
        console.log('   • Lionel: l.camboulives@stmathieu.org / lionel2024!');
        console.log('   • Frank: frank.quaracino@orange.fr / frank2024!');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createEssentialUsers();
