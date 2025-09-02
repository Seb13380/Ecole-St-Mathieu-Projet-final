const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./src/services/emailService');

async function testEmailNotification() {
    try {
        console.log('🔍 Vérification des parents...');
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        console.log(`📊 ${parents.length} parents trouvés:`);
        parents.forEach(parent => {
            console.log(`  - ${parent.email}`);
        });

        // Créer une actualité de test
        console.log('\n📝 Création d\'une actualité de test...');
        const actualite = await prisma.actualite.create({
            data: {
                titre: 'Test notification email',
                contenu: 'Ceci est un test pour vérifier les notifications email aux parents.',
                datePublication: new Date(),
                important: true,
                visible: true,
                auteurId: 6 // ID de Lionel
            },
            include: {
                auteur: true
            }
        });

        console.log(`✅ Actualité créée: ${actualite.titre}`);

        // Test des notifications
        console.log('\n📧 Test des notifications email...');
        const parentEmails = parents.map(parent => parent.email);
        console.log('📮 Envoi vers:', parentEmails);

        await emailService.sendNewActualiteNotification(actualite, parentEmails);

        console.log('✅ Test terminé - vérifiez vos boîtes email !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testEmailNotification();
