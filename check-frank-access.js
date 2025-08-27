const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFrankAccess() {
    try {
        console.log('🔍 Vérification des accès de Frank...');

        // Trouver Frank
        const frank = await prisma.user.findFirst({
            where: {
                email: 'frank@stmathieu.org'
            }
        });

        if (!frank) {
            console.log('❌ Frank non trouvé !');
            return;
        }

        console.log('👤 Frank trouvé:', {
            id: frank.id,
            email: frank.email,
            firstName: frank.firstName,
            lastName: frank.lastName,
            role: frank.role
        });

        // Vérifier les rôles autorisés pour requireDirection
        const allowedRolesDirection = ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'];
        const hasDirectionAccess = allowedRolesDirection.includes(frank.role);

        console.log('🔑 Accès requireDirection:', hasDirectionAccess ? '✅ OUI' : '❌ NON');
        console.log('🔑 Rôles autorisés pour Direction:', allowedRolesDirection);
        console.log('🔑 Rôle actuel de Frank:', frank.role);

        // Vérifier les rôles autorisés pour requireAdmin  
        const allowedRolesAdmin = ['ADMIN', 'DIRECTION', 'GESTIONNAIRE_SITE'];
        const hasAdminAccess = allowedRolesAdmin.includes(frank.role);

        console.log('🔑 Accès requireAdmin:', hasAdminAccess ? '✅ OUI' : '❌ NON');

        // Tester l'accès aux actualités
        const actualitesCount = await prisma.actualite.count();
        console.log('📰 Nombre d\'actualités total:', actualitesCount);

        // Vérifier si Frank peut créer une actualité
        try {
            console.log('🧪 Test de création d\'actualité...');

            const testActualite = await prisma.actualite.create({
                data: {
                    titre: 'Test Frank - Actualité de vérification',
                    contenu: 'Ceci est un test pour vérifier que Frank peut créer des actualités.',
                    auteurId: frank.id,
                    visible: false, // On la cache pour que ce soit juste un test
                    important: false
                }
            });

            console.log('✅ Frank peut créer des actualités !', testActualite.id);

            // Supprimer l'actualité de test
            await prisma.actualite.delete({
                where: { id: testActualite.id }
            });
            console.log('🗑️ Actualité de test supprimée');

        } catch (error) {
            console.log('❌ Frank ne peut pas créer d\'actualités:', error.message);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkFrankAccess();
