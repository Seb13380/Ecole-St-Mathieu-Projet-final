const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateFrankRole() {
    try {
        console.log('=== MISE À JOUR DU RÔLE DE FRANK ===');

        // Recherche de Frank
        const frank = await prisma.user.findFirst({
            where: {
                firstName: 'Frank',
                lastName: 'Quaracino'
            }
        });

        if (!frank) {
            console.log('❌ Frank non trouvé');
            return;
        }

        console.log('Frank trouvé:', {
            id: frank.id,
            nom: `${frank.firstName} ${frank.lastName}`,
            email: frank.email,
            rôle_actuel: frank.role
        });

        // Mise à jour du rôle
        const updatedFrank = await prisma.user.update({
            where: { id: frank.id },
            data: { role: 'DIRECTION' }
        });

        console.log('✅ Rôle mis à jour avec succès:');
        console.log({
            id: updatedFrank.id,
            nom: `${updatedFrank.firstName} ${updatedFrank.lastName}`,
            email: updatedFrank.email,
            ancien_rôle: frank.role,
            nouveau_rôle: updatedFrank.role
        });

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateFrankRole();
