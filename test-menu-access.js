// Test d'acces aux menus PDF pour Frank et Sebastien
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testMenuAccess() {
    console.log('Test d\'acces aux menus PDF pour Frank et Sebastien...\n');

    try {
        // Verifier Frank
        const frank = await prisma.user.findUnique({
            where: { email: 'frank.maintenance@ecole-saint-mathieu.fr' }
        });

        if (frank) {
            console.log('Frank trouve :');
            console.log(`   Nom: ${frank.firstName} ${frank.lastName}`);
            console.log(`   Role: ${frank.role}`);
            console.log(`   Email: ${frank.email}`);

            // Verifier l'acces aux menus
            const allowedRoles = ['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN'];
            const hasAccess = allowedRoles.includes(frank.role);
            console.log(`   Acces menus PDF: ${hasAccess ? 'Autorise' : 'Refuse'}`);

            if (!hasAccess) {
                console.log('   Correction du role necessaire...');
                await prisma.user.update({
                    where: { id: frank.id },
                    data: { role: 'MAINTENANCE_SITE' }
                });
                console.log('   Role mis a jour vers MAINTENANCE_SITE');
            }
        } else {
            console.log('Frank non trouve');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Verifier Sebastien
        const sebastien = await prisma.user.findUnique({
            where: { email: 'sebastien.admin@ecole-saint-mathieu.fr' }
        });

        if (sebastien) {
            console.log('Sebastien trouve :');
            console.log(`   Nom: ${sebastien.firstName} ${sebastien.lastName}`);
            console.log(`   Role: ${sebastien.role}`);
            console.log(`   Email: ${sebastien.email}`);

            // Verifier l'acces aux menus
            const allowedRoles = ['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN'];
            const hasAccess = allowedRoles.includes(sebastien.role);
            console.log(`   Acces menus PDF: ${hasAccess ? 'Autorise' : 'Refuse'}`);
        } else {
            console.log('Sebastien non trouve');
        }

        console.log('\nResume des permissions pour /admin/menus-pdf :');
        console.log('   DIRECTION (Lionel)');
        console.log('   MAINTENANCE_SITE (Frank)');
        console.log('   ADMIN (Sebastien)');
        console.log('\nPour tester manuellement :');
        console.log('   1. Se connecter avec un des comptes ci-dessus');
        console.log('   2. Aller sur http://localhost:3007/admin/menus-pdf');
        console.log('   3. Uploader un PDF de menu');
        console.log('   4. Le menu sera visible dans /restauration sous "Le chef Serge vous propose"');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testMenuAccess();
