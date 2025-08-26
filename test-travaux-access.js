const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTravauxAccess() {
    try {
        console.log('🔍 Test d\'accès aux travaux...');

        // Vérifier les utilisateurs avec rôle DIRECTION ou MAINTENANCE_SITE
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']
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

        console.log('\n👥 Utilisateurs autorisés à gérer les travaux:');
        users.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Rôle: ${user.role}`);
        });

        // Vérifier les travaux existants
        const travaux = await prisma.travaux.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true, role: true }
                }
            }
        });

        console.log(`\n🔨 Travaux dans la base de données: ${travaux.length}`);
        travaux.forEach(travail => {
            console.log(`- "${travail.titre}" par ${travail.auteur.firstName} ${travail.auteur.lastName} (${travail.statut}, ${travail.progression}%)`);
        });

        console.log('\n✅ Test terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTravauxAccess();
