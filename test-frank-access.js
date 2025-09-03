const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFrankAccess() {
    try {
        console.log('🔍 Test d\'accès pour Frank...');

        // Récupérer Frank
        const frank = await prisma.user.findFirst({
            where: {
                email: 'frank.quaracino@orange.fr'
            }
        });

        if (!frank) {
            console.log('❌ Frank non trouvé');
            return;
        }

        console.log('✅ Frank trouvé:');
        console.log(`- ID: ${frank.id}`);
        console.log(`- Nom: ${frank.firstName} ${frank.lastName}`);
        console.log(`- Email: ${frank.email}`);
        console.log(`- Rôle: ${frank.role}`);

        // Tester les conditions d'accès courantes
        const hasDirectionAccess = ['DIRECTION', 'ADMIN'].includes(frank.role);
        const hasGestionnaireAccess = ['DIRECTION', 'GESTIONNAIRE_SITE', 'ADMIN'].includes(frank.role);

        console.log('\n🎯 Tests d\'accès:');
        console.log(`- Accès DIRECTION/ADMIN: ${hasDirectionAccess ? '✅' : '❌'}`);
        console.log(`- Accès GESTIONNAIRE_SITE/DIRECTION/ADMIN: ${hasGestionnaireAccess ? '✅' : '❌'}`);

        // Simuler les vérifications des middlewares importants
        console.log('\n🛡️ Vérifications middleware:');
        console.log(`- parent-invitations/manage: ${['DIRECTION', 'ADMIN'].includes(frank.role) ? '✅' : '❌'}`);
        console.log(`- directeur routes: ${['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'].includes(frank.role) ? '✅' : '❌'}`);
        console.log(`- frank dashboard: ${['GESTIONNAIRE_SITE', 'DIRECTION'].includes(frank.role) && ['frank.quaracino@orange.fr', 'frank@ecolestmathieu.com'].includes(frank.email) ? '✅' : '❌'}`);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFrankAccess();
