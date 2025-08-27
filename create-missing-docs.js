const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingDocuments() {
    try {
        // Trouver l'utilisateur Lionel pour être l'auteur
        const lionel = await prisma.user.findFirst({
            where: { role: 'DIRECTION' }
        });

        if (!lionel) {
            console.log('❌ Utilisateur DIRECTION non trouvé');
            return;
        }

        const documentsToCreate = [
            {
                type: 'PROJET_ETABLISSEMENT',
                titre: 'Projet d\'établissement',
                description: 'Le projet d\'établissement définit les orientations pédagogiques et éducatives de l\'école Saint-Mathieu.',
                contenu: '<h1>Projet d\'établissement</h1><p>Contenu à compléter...</p>',
                active: true,
                auteurId: lionel.id
            },
            {
                type: 'ORGANIGRAMME',
                titre: 'Organigramme de l\'école',
                description: 'Structure organisationnelle et hiérarchique de l\'école Saint-Mathieu.',
                contenu: '<h1>Organigramme</h1><p>Structure à compléter...</p>',
                active: true,
                auteurId: lionel.id
            },
            {
                type: 'CHARTE_LAICITE',
                titre: 'Charte de la laïcité',
                description: 'Principes de laïcité applicables dans l\'établissement.',
                contenu: '<h1>Charte de la laïcité</h1><p>Principes à définir...</p>',
                active: true,
                auteurId: lionel.id
            },
            {
                type: 'CHARTE_NUMERIQUE',
                titre: 'Charte du numérique',
                description: 'Règles d\'usage des outils numériques à l\'école.',
                contenu: '<h1>Charte du numérique</h1><p>Règles à définir...</p>',
                active: true,
                auteurId: lionel.id
            }
        ];

        for (const doc of documentsToCreate) {
            const existing = await prisma.document.findFirst({
                where: { type: doc.type }
            });

            if (!existing) {
                await prisma.document.create({ data: doc });
                console.log('✅ Document créé:', doc.type, '-', doc.titre);
            } else {
                console.log('ℹ️ Document existe déjà:', doc.type);
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createMissingDocuments();
