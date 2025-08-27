const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin(email, password) {
    try {
        console.log(`\n🔐 Test de connexion pour: ${email}`);

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return false;
        }

        console.log('✅ Utilisateur trouvé:', user.firstName, user.lastName);
        console.log('   Rôle:', user.role);

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            console.log('✅ Mot de passe correct');
            console.log('✅ Connexion réussie !');
            return true;
        } else {
            console.log('❌ Mot de passe incorrect');
            return false;
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        return false;
    }
}

async function runTests() {
    try {
        console.log('=== TEST DE CONNEXION VPS ===');

        // Test Lionel
        const lionelSuccess = await testLogin('l.camboulives@stmathieu.org', 'lionel123');

        // Test Frank
        const frankSuccess = await testLogin('frank@stmathieu.org', 'frank123');

        console.log('\n=== RÉSULTAT FINAL ===');
        console.log(`Lionel: ${lionelSuccess ? '✅ OK' : '❌ ÉCHEC'}`);
        console.log(`Frank: ${frankSuccess ? '✅ OK' : '❌ ÉCHEC'}`);

        if (lionelSuccess && frankSuccess) {
            console.log('\n🎉 Tous les comptes sont prêts !');
            console.log('Vous pouvez maintenant vous connecter sur votre VPS avec ces identifiants.');
        } else {
            console.log('\n⚠️ Il y a encore des problèmes à résoudre.');
        }

        console.log('\n📋 URL de connexion: https://votre-domaine.com/login');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
