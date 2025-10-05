const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTestEmails() {
    try {
        console.log('🧹 Nettoyage des emails de test...\n');

        // Trouver tous les utilisateurs avec des emails de test
        const testUsers = await prisma.user.findMany({
            where: {
                email: {
                    endsWith: '@test.com'
                }
            }
        });

        console.log(`📧 Emails de test trouvés: ${testUsers.length}`);
        testUsers.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName}: ${user.email}`);
        });

        if (testUsers.length > 0) {
            // Remplacer par des emails désactivés
            const updateResult = await prisma.user.updateMany({
                where: {
                    email: {
                        endsWith: '@test.com'
                    }
                },
                data: {
                    email: prisma.$executeRaw`CONCAT(firstName, '.', lastName, '@disabled-test.local')`
                }
            });

            console.log(`\n✅ ${updateResult.count} emails de test nettoyés`);

            // Alternative plus simple
            for (const user of testUsers) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        email: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@disabled-test.local`
                    }
                });
                console.log(`   ✅ ${user.firstName} ${user.lastName}: email mis à jour`);
            }
        }

        // Vérifier le résultat
        const remainingTestEmails = await prisma.user.count({
            where: {
                email: {
                    endsWith: '@test.com'
                }
            }
        });

        console.log(`\n📊 Emails @test.com restants: ${remainingTestEmails}`);
        console.log('✅ Nettoyage terminé ! Les emails ne seront plus envoyés vers ces adresses.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanTestEmails();