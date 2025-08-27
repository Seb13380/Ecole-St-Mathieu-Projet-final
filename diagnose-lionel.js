const { PrismaClient } = require('@prisma/client');

async function diagnoseLionelAccess() {
    const prisma = new PrismaClient();

    try {
        console.log('=== DIAGNOSTIC ACCÈS LIONEL ===\n');

        // Récupérer Lionel
        const lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@stmathieu.org' }
        });

        if (!lionel) {
            console.log('❌ Lionel non trouvé avec email: l.camboulives@stmathieu.org');

            // Chercher avec d'autres emails possibles
            const possibleEmails = [
                'lionel.camboulives@ecole-st-mathieu.fr',
                'lionel.camboulives@ecole-saint-mathieu.fr',
                'l.camboulives@stmathieu.org'
            ];

            for (const email of possibleEmails) {
                const user = await prisma.user.findUnique({
                    where: { email }
                });
                if (user) {
                    console.log(`✅ Trouvé avec: ${email}`);
                    console.log(`   Rôle: ${user.role}`);
                    break;
                }
            }
            return;
        }

        console.log(`✅ Lionel trouvé:`);
        console.log(`   ID: ${lionel.id}`);
        console.log(`   Email: ${lionel.email}`);
        console.log(`   Nom: ${lionel.firstName} ${lionel.lastName}`);
        console.log(`   Rôle: ${lionel.role}`);
        console.log(`   Actif: ${lionel.active}`);

        // Vérifier les permissions
        const allowedRoles = ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'];
        const hasAccess = allowedRoles.includes(lionel.role);

        console.log(`\n🔐 Analyse des permissions:`);
        console.log(`   Rôles autorisés: ${allowedRoles.join(', ')}`);
        console.log(`   Rôle de Lionel: ${lionel.role}`);
        console.log(`   Accès autorisé: ${hasAccess ? '✅ OUI' : '❌ NON'}`);

        if (!hasAccess) {
            console.log('\n❌ PROBLÈME: Le rôle de Lionel ne permet pas l\'accès à /documents/admin');
            console.log('🔧 Solution: Modifier le rôle ou le middleware');
        } else {
            console.log('\n✅ Le rôle devrait permettre l\'accès. Le problème est ailleurs.');
            console.log('💡 Vérifiez:');
            console.log('   1. La session utilisateur');
            console.log('   2. Le middleware requireDirection');
            console.log('   3. Les routes');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseLionelAccess();
