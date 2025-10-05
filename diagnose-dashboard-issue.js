const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseDashboardIssue() {
    console.log('🔍 === DIAGNOSTIC DASHBOARD SECRÉTAIRE ===\n');

    try {
        // 1. Vérifier le compte de Yamina
        const yamina = await prisma.user.findFirst({
            where: {
                role: 'SECRETAIRE_DIRECTION'
            }
        });

        if (yamina) {
            console.log('👤 Compte secrétaire trouvé:');
            console.log(`   ID: ${yamina.id}`);
            console.log(`   Nom: ${yamina.firstName} ${yamina.lastName}`);
            console.log(`   Email: ${yamina.email}`);
            console.log(`   Rôle: ${yamina.role}`);
            console.log(`   Mot de pass: ${yamina.password ? 'Défini ✅' : 'Non défini ❌'}`);
            console.log(`   Créé le: ${yamina.createdAt.toLocaleString('fr-FR')}`);
        } else {
            console.log('❌ Aucun compte SECRETAIRE_DIRECTION trouvé');

            // Chercher par email
            const yaminaByEmail = await prisma.user.findFirst({
                where: {
                    email: 'ecole-saint-mathieu@wanadoo.fr'
                }
            });

            if (yaminaByEmail) {
                console.log('📧 Compte trouvé par email:');
                console.log(`   Nom: ${yaminaByEmail.firstName} ${yaminaByEmail.lastName}`);
                console.log(`   Email: ${yaminaByEmail.email}`);
                console.log(`   Rôle: ${yaminaByEmail.role}`);
                console.log(`   ⚠️ PROBLÈME: Le rôle devrait être SECRETAIRE_DIRECTION`);
            }
        }

        // 2. Lister tous les utilisateurs avec leurs rôles
        console.log('\n📊 Tous les utilisateurs:');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            },
            orderBy: {
                role: 'asc'
            }
        });

        users.forEach(user => {
            console.log(`   ${user.id}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

        // 3. URLs recommandées
        console.log('\n🌐 URLs à tester:');
        console.log('   Dashboard secrétaire: http://localhost:3007/secretaire/dashboard');
        console.log('   Login: http://localhost:3007/auth/login');
        console.log('   Dashboard directeur: http://localhost:3007/directeur/dashboard');

        // 4. Informations de connexion
        console.log('\n🔑 Informations de connexion Yamina:');
        if (yamina) {
            console.log(`   Email: ${yamina.email}`);
            console.log('   Mot de passe: (Le mot de passe défini lors de la création)');
        } else {
            console.log('   ❌ Compte non trouvé - il faut le créer');
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseDashboardIssue().catch(console.error);