const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleDocuments() {
    try {
        console.log('🌱 Création de documents de test...');

        // Trouver Frank pour être l'auteur
        const frank = await prisma.user.findFirst({
            where: { role: 'GESTIONNAIRE_SITE' }
        });

        if (!frank) {
            console.log('❌ Frank (GESTIONNAIRE_SITE) non trouvé');
            return;
        }

        console.log(`✅ Frank trouvé: ${frank.firstName} ${frank.lastName}`);

        // Documents de test
        const sampleDocuments = [
            {
                type: 'PROJET_EDUCATIF',
                titre: 'Projet Éducatif 2025-2026',
                description: 'Notre vision éducative pour accompagner chaque enfant dans son développement.',
                contenu: '<h1>Projet Éducatif</h1><p>Notre école s\'engage à offrir un enseignement de qualité dans un environnement bienveillant.</p>',
                active: true,
                auteurId: frank.id
            },
            {
                type: 'REGLEMENT_INTERIEUR',
                titre: 'Règlement Intérieur de l\'École',
                description: 'Les règles de vie et de fonctionnement de notre établissement.',
                contenu: '<h1>Règlement Intérieur</h1><p>Ce document présente les règles essentielles de notre établissement.</p>',
                active: true,
                auteurId: frank.id
            },
            {
                type: 'CHARTE_LAICITE',
                titre: 'Charte de la Laïcité',
                description: 'Nos principes de respect et de vivre-ensemble.',
                contenu: '<h1>Charte de la Laïcité</h1><p>La laïcité est un principe fondamental de notre République.</p>',
                active: true,
                auteurId: frank.id
            },
            {
                type: 'PASTORALE_AXE',
                titre: 'Axe Pastoral de l\'École',
                description: 'L\'orientation spirituelle et humaine de notre établissement catholique.',
                contenu: '<h1>Axe Pastoral</h1><p>Notre école s\'appuie sur les valeurs chrétiennes d\'amour et de partage.</p>',
                active: true,
                auteurId: frank.id
            }
        ];

        console.log('\n📄 Création des documents...');
        for (const docData of sampleDocuments) {
            const document = await prisma.document.create({
                data: docData
            });
            console.log(`✅ Créé: ${document.titre} (${document.type})`);
        }

        console.log('\n🎉 Documents de test créés avec succès !');
        console.log('\n📊 Résumé:');

        const totalDocs = await prisma.document.count();
        console.log(`Total documents: ${totalDocs}`);

        const docsByType = await prisma.document.groupBy({
            by: ['type'],
            _count: true
        });

        docsByType.forEach(group => {
            console.log(`- ${group.type}: ${group._count} document(s)`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleDocuments();
