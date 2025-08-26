// Script de test pour vérifier les comptes créés
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAccounts() {
    try {
        console.log('🧪 Test des comptes administratifs...\n');

        // Vérifier Lionel
        const lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@stmathieu.org' }
        });

        if (lionel) {
            console.log('✅ Lionel Camboulives:');
            console.log(`   📧 Email: ${lionel.email}`);
            console.log(`   👤 Nom: ${lionel.firstName} ${lionel.lastName}`);
            console.log(`   🎭 Rôle: ${lionel.role}\n`);
        } else {
            console.log('❌ Lionel non trouvé\n');
        }

        // Vérifier Frank
        const frank = await prisma.user.findUnique({
            where: { email: 'frank@stmathieu.org' }
        });

        if (frank) {
            console.log('✅ Frank Gestionnaire:');
            console.log(`   📧 Email: ${frank.email}`);
            console.log(`   👤 Nom: ${frank.firstName} ${frank.lastName}`);
            console.log(`   🎭 Rôle: ${frank.role}`);
            console.log(`   🔑 Mot de passe: Frank2025!\n`);
        } else {
            console.log('❌ Frank non trouvé\n');
        }

        // Résumé de tous les comptes admin
        console.log('📋 Tous les comptes administratifs:');
        console.log('=====================================');

        const adminUsers = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'DIRECTION', 'GESTIONNAIRE_SITE']
                }
            },
            orderBy: { role: 'asc' }
        });

        adminUsers.forEach(user => {
            console.log(`${user.role.padEnd(20)} | ${user.firstName} ${user.lastName} | ${user.email}`);
        });

        console.log('\n✅ Test terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAccounts();
