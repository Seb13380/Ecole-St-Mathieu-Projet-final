const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function diagnoseUsers() {
    try {
        console.log('=== DIAGNOSTIC UTILISATEURS VPS ===\n');

        // Recherche Lionel
        const lionel = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { contains: 'lionel' } },
                    { firstName: { contains: 'Lionel' } },
                    { lastName: { contains: 'Lionel' } }
                ]
            }
        });

        // Recherche Frank
        const frank = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { contains: 'frank' } },
                    { firstName: { contains: 'Frank' } },
                    { lastName: { contains: 'Frank' } },
                    { firstName: { contains: 'Franck' } },
                    { lastName: { contains: 'Franck' } }
                ]
            }
        });

        console.log('🔍 LIONEL:');
        if (lionel) {
            console.log('✅ Trouvé:');
            console.log('  - ID:', lionel.id);
            console.log('  - Email:', lionel.email);
            console.log('  - Nom:', lionel.firstName, lionel.lastName);
            console.log('  - Rôle:', lionel.role);
            console.log('  - Mot de passe hashé:', lionel.password.substring(0, 20) + '...');
        } else {
            console.log('❌ Lionel non trouvé');
        }

        console.log('\n🔍 FRANK:');
        if (frank) {
            console.log('✅ Trouvé:');
            console.log('  - ID:', frank.id);
            console.log('  - Email:', frank.email);
            console.log('  - Nom:', frank.firstName, frank.lastName);
            console.log('  - Rôle:', frank.role);
            console.log('  - Mot de passe hashé:', frank.password.substring(0, 20) + '...');
        } else {
            console.log('❌ Frank non trouvé');
        }

        // Liste tous les utilisateurs pour voir ce qu'on a
        console.log('\n📋 TOUS LES UTILISATEURS:');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            },
            orderBy: { id: 'asc' }
        });

        allUsers.forEach(user => {
            console.log(`  ${user.id}: ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

        console.log('\n=== ACTIONS RECOMMANDÉES ===');

        if (!lionel) {
            console.log('🚨 CRÉER LIONEL');
        } else {
            console.log('🔧 RÉINITIALISER MOT DE PASSE LIONEL');
        }

        if (!frank) {
            console.log('🚨 CRÉER FRANK');
        } else {
            console.log('🔧 RÉINITIALISER MOT DE PASSE FRANK');
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseUsers();
