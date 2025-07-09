const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testDirectLogin() {
    try {
        console.log('🔐 Test direct de connexion...\n');

        // Simuler une connexion directe
        const email = 'l.camboulives@orange.fr';
        const password = 'AdminStMathieu2024!';

        console.log('1. Recherche de l\'utilisateur...');
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return;
        }

        console.log('✅ Utilisateur trouvé:', user.email);

        console.log('2. Vérification du mot de passe...');
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            console.log('❌ Mot de passe incorrect');
            return;
        }

        console.log('✅ Mot de passe correct');

        console.log('3. Simulation de création de session...');
        const sessionUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };

        console.log('✅ Session simulée:', sessionUser);

        console.log('4. Test de redirection selon le rôle...');
        let redirectUrl;
        switch (user.role) {
            case 'ADMIN':
            case 'DIRECTION':
                redirectUrl = '/admin/dashboard';
                break;
            case 'ENSEIGNANT':
                redirectUrl = '/enseignant/dashboard';
                break;
            case 'PARENT':
                redirectUrl = '/parent/dashboard';
                break;
            default:
                redirectUrl = '/';
        }

        console.log('✅ Redirection vers:', redirectUrl);

        console.log('\n🎉 Test de connexion réussi !');
        console.log('📧 Email:', email);
        console.log('🔑 Mot de passe:', password);
        console.log('🎯 URL cible:', redirectUrl);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDirectLogin();
