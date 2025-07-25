const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLionel() {
    try {
        console.log('🔍 Vérification du compte Lionel Camboulives...\n');

        const lionel = await prisma.user.findUnique({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });

        if (!lionel) {
            console.log('❌ Lionel Camboulives non trouvé !');
            return;
        }

        console.log('✅ Lionel Camboulives trouvé :');
        console.log(`   📧 Email: ${lionel.email}`);
        console.log(`   👤 Nom: ${lionel.firstName} ${lionel.lastName}`);
        console.log(`   🎭 Rôle: ${lionel.role}`);
        console.log(`   🔑 A un mot de passe: ${lionel.password ? 'Oui' : 'Non'}`);
        console.log(`   📅 Créé: ${lionel.createdAt}`);

        // Vérifier que le rôle est bien DIRECTION
        if (lionel.role === 'DIRECTION') {
            console.log('\n🎯 Le rôle est correct : DIRECTION');
            console.log('✅ Lionel devrait pouvoir accéder au dashboard directeur');
        } else {
            console.log(`\n⚠️  Rôle incorrect : ${lionel.role} (attendu: DIRECTION)`);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLionel();
