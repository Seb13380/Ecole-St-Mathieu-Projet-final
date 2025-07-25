const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testDirecteurAccess() {
    try {
        console.log('🧪 Test d\'accès dashboard directeur pour Lionel...\n');

        // 1. Vérifier Lionel dans la base
        const lionel = await prisma.user.findUnique({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });

        if (!lionel) {
            console.log('❌ Lionel non trouvé !');
            return;
        }

        console.log('✅ Lionel trouvé :');
        console.log(`   👤 ${lionel.firstName} ${lionel.lastName}`);
        console.log(`   🎭 Rôle: ${lionel.role}`);
        console.log(`   📧 Email: ${lionel.email}`);

        // 2. Vérifier le mot de passe
        const password = 'Directeur2025!';
        const isPasswordValid = await bcrypt.compare(password, lionel.password);
        console.log(`   🔑 Mot de passe valide: ${isPasswordValid ? 'Oui' : 'Non'}`);

        if (!isPasswordValid) {
            console.log('❌ Problème avec le mot de passe !');
            return;
        }

        // 3. Simuler la vérification du contrôleur
        console.log('\n🎯 Simulation de l\'accès au dashboard :');

        if (lionel.role === 'DIRECTION') {
            console.log('✅ Rôle DIRECTION → Accès autorisé au dashboard directeur');
            console.log('✅ Template utilisé: pages/directeur/dashboard.twig');
        } else {
            console.log(`❌ Rôle ${lionel.role} → Accès refusé`);
        }

        // 4. Récupérer quelques stats pour le dashboard
        console.log('\n📊 Récupération des statistiques :');
        const stats = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.classe.count()
        ]);

        console.log(`   👥 Utilisateurs: ${stats[0]}`);
        console.log(`   👶 Élèves: ${stats[1]}`);
        console.log(`   🏫 Classes: ${stats[2]}`);

        console.log('\n🎉 Test terminé avec succès !');
        console.log('\n📝 Pour tester manuellement :');
        console.log('   1. Aller sur http://localhost:3007/login');
        console.log('   2. Se connecter avec lionel.camboulives@ecole-saint-mathieu.fr');
        console.log('   3. Mot de passe: Directeur2025!');
        console.log('   4. Devrait être redirigé vers /directeur/dashboard');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDirecteurAccess();
