const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkParents() {
    try {
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        console.log(`Parents trouvés: ${parents.length}`);
        parents.forEach(parent => {
            console.log(`- ${parent.email} (${parent.firstName} ${parent.lastName})`);
        });

        if (parents.length === 0) {
            console.log('\n❌ Aucun parent dans la base de données - création nécessaire');
        } else {
            console.log('\n✅ Parents disponibles pour notifications email');
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkParents();
