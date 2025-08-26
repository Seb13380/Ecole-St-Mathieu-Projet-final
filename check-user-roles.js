const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRoles() {
    console.log('🔍 Vérification des rôles d\'utilisateurs dans la base...\n');

    try {
        // Requête SQL brute pour voir les rôles existants
        const rolesCount = await prisma.$queryRaw`
            SELECT role, COUNT(*) as count 
            FROM User 
            GROUP BY role
        `;

        console.log('Rôles actuellement utilisés:');
        rolesCount.forEach(row => {
            console.log(`  - ${row.role}: ${row.count} utilisateur(s)`);
        });

        // Voir les détails des utilisateurs avec les anciens rôles
        console.log('\n📋 Utilisateurs avec des rôles à migrer:');

        const problematicUsers = await prisma.$queryRaw`
            SELECT id, firstName, lastName, email, role 
            FROM User 
            WHERE role IN ('SECRETAIRE_DIRECTION', 'RESTAURATION')
        `;

        if (problematicUsers.length > 0) {
            problematicUsers.forEach(user => {
                console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) : ${user.role}`);
            });

            console.log('\n💡 Solutions proposées:');
            console.log('  SECRETAIRE_DIRECTION → ASSISTANT_DIRECTION');
            console.log('  RESTAURATION → MAINTENANCE_SITE');
        } else {
            console.log('  Aucun utilisateur avec les anciens rôles trouvé.');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserRoles();
