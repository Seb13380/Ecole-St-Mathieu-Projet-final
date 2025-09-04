const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCredentials() {
    try {
        // 1. Vérifier les parents existants
        console.log('=== PARENTS EXISTANTS ===');
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
            }
        });
        console.log('Parents trouvés:', parents.length);
        parents.forEach(p => console.log(`- ${p.firstName} ${p.lastName} (${p.email})`));

        if (parents.length > 0) {
            // 2. Tester la recherche comme dans le contrôleur
            const testParent = parents[0];
            console.log('\n=== TEST RECHERCHE ===');
            console.log('Test avec:', testParent);

            const searchResult = await prisma.user.findFirst({
                where: {
                    email: testParent.email.toLowerCase().trim(),
                    role: 'PARENT',
                    AND: [
                        {
                            firstName: {
                                contains: testParent.firstName.trim()
                            }
                        },
                        {
                            lastName: {
                                contains: testParent.lastName.trim()
                            }
                        }
                    ]
                }
            });

            console.log('Résultat recherche:', searchResult ? 'TROUVÉ' : 'NON TROUVÉ');
            if (searchResult) {
                console.log('- ID:', searchResult.id);
                console.log('- Nom:', searchResult.firstName, searchResult.lastName);
                console.log('- Email:', searchResult.email);
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCredentials();
