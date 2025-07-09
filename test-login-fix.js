const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
    try {
        console.log('🔍 Test de connexion...');

        // Vérifier l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return;
        }

        console.log('✅ Utilisateur trouvé:', {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });

        // Tester le mot de passe
        const testPassword = 'StMathieu2025!';
        const isValid = await bcrypt.compare(testPassword, user.password);

        console.log('🔑 Test mot de passe:', isValid ? '✅ VALIDE' : '❌ INVALIDE');

        if (!isValid) {
            console.log('🔧 Réinitialisation du mot de passe...');
            const newHash = await bcrypt.hash('StMathieu2025!', 10);

            await prisma.user.update({
                where: { email: 'l.camboulives@orange.fr' },
                data: { password: newHash }
            });

            console.log('✅ Mot de passe réinitialisé !');
        }

        console.log('\n📋 Utilisez ces identifiants :');
        console.log('Email: l.camboulives@orange.fr');
        console.log('Mot de passe: StMathieu2025!');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
