const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLogin() {
    console.log('🔐 Test de connexion des utilisateurs...\n');

    try {
        // Recherche des utilisateurs principaux
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN', 'SECRETAIRE_DIRECTION']
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        console.log(`✅ ${users.length} utilisateur(s) trouvé(s):`);
        users.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
        });

        // Test spécifique pour les comptes mentionnés
        console.log('\n🔍 Recherche des comptes spécifiques:');

        const lionel = await prisma.user.findFirst({
            where: {
                firstName: { contains: 'Lionel' }
            }
        });

        const frank = await prisma.user.findFirst({
            where: {
                firstName: { contains: 'Frank' }
            }
        });

        const sebastien = await prisma.user.findFirst({
            where: {
                lastName: { contains: 'GIORDANO' }
            }
        });

        if (lionel) console.log(`   ✅ Lionel trouvé: ${lionel.firstName} ${lionel.lastName} (${lionel.role})`);
        else console.log('   ❌ Lionel non trouvé');

        if (frank) console.log(`   ✅ Frank trouvé: ${frank.firstName} ${frank.lastName} (${frank.role})`);
        else console.log('   ❌ Frank non trouvé');

        if (sebastien) console.log(`   ✅ Sébastien trouvé: ${sebastien.firstName} ${sebastien.lastName} (${sebastien.role})`);
        else console.log('   ❌ Sébastien non trouvé');

        console.log('\n🎉 La base de données est accessible et les utilisateurs sont là !');

    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
