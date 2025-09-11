const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getLionelInfo() {
    try {
        console.log('🔍 Recherche des informations de Lionel...');

        // Chercher Lionel par nom
        const lionel = await prisma.user.findFirst({
            where: {
                OR: [
                    { firstName: { contains: 'lionel', mode: 'insensitive' } },
                    { lastName: { contains: 'lionel', mode: 'insensitive' } },
                    { firstName: { contains: 'Lionel' } },
                    { lastName: { contains: 'Lionel' } }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                lastLogin: true
            }
        });

        if (lionel) {
            console.log('✅ Lionel trouvé:');
            console.log(`📧 Email: ${lionel.email}`);
            console.log(`👤 Nom: ${lionel.firstName} ${lionel.lastName}`);
            console.log(`📱 Téléphone: ${lionel.phone || 'Non renseigné'}`);
            console.log(`🔑 Rôle: ${lionel.role}`);
            console.log(`📅 Créé le: ${lionel.createdAt}`);
            console.log(`🕐 Dernière connexion: ${lionel.lastLogin || 'Jamais'}`);
        } else {
            console.log('❌ Lionel non trouvé. Recherche par email contenant "lionel"...');

            const usersByEmail = await prisma.user.findMany({
                where: {
                    email: { contains: 'lionel', mode: 'insensitive' }
                },
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            });

            console.log('Utilisateurs avec "lionel" dans l\'email:', usersByEmail);
        }

        // Chercher aussi les messages/logs s'il y en a
        const allUsers = await prisma.user.findMany({
            select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
            },
            orderBy: { firstName: 'asc' }
        });

        console.log('\n📋 Tous les utilisateurs:');
        allUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

getLionelInfo();
