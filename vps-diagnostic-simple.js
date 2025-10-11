const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== DIAGNOSTIC PARENTS SANS ENFANTS ===\n');

        // Compter tous les parents
        const totalParents = await prisma.user.count({
            where: { role: 'PARENT' }
        });
        console.log(`Total parents: ${totalParents}`);

        // Compter les relations parent-élève
        const totalRelations = await prisma.parentEleve.count();
        console.log(`Total relations parent-élève: ${totalRelations}`);

        // Trouver les parents sans enfants
        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                parentsEleves: {
                    none: {}
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });

        console.log(`\nParents SANS enfants: ${parentsWithoutChildren.length}`);

        if (parentsWithoutChildren.length > 0) {
            console.log('\nListe des parents sans enfants:');
            parentsWithoutChildren.forEach(parent => {
                console.log(`- ${parent.firstName} ${parent.lastName} (ID: ${parent.id}, Email: ${parent.email})`);
            });
        }

        console.log('\n=== FIN DU DIAGNOSTIC ===');

    } catch (error) {
        console.error('Erreur:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
