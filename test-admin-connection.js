const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAdminConnection() {
    try {
        console.log('🔍 Test de connexion admin...\n');

        // 1. Vérifier l'existence de l'admin
        const admin = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (!admin) {
            console.log('❌ Admin non trouvé avec l\'email l.camboulives@orange.fr');

            // Lister tous les utilisateurs admin
            const allAdmins = await prisma.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'DIRECTION'] }
                }
            });

            console.log('\n📋 Utilisateurs admin existants:');
            allAdmins.forEach(user => {
                console.log(`- ${user.email} (${user.role}) - ID: ${user.id}`);
            });

            return;
        }

        console.log('✅ Admin trouvé:');
        console.log(`- Email: ${admin.email}`);
        console.log(`- Nom: ${admin.firstName} ${admin.lastName}`);
        console.log(`- Rôle: ${admin.role}`);
        console.log(`- ID: ${admin.id}`);
        console.log(`- Créé le: ${admin.createdAt}`);

        // 2. Tester le mot de passe
        console.log('\n🔐 Test du mot de passe...');
        const testPasswords = ['AdminStMathieu2024!', 'admin123!', 'Admin123!', 'laurent123!', 'Laurent123!'];

        let passwordFound = false;
        for (const password of testPasswords) {
            const isValid = await bcrypt.compare(password, admin.password);
            if (isValid) {
                console.log(`✅ Mot de passe valide: ${password}`);
                passwordFound = true;
                break;
            } else {
                console.log(`❌ Mot de passe invalide: ${password}`);
            }
        }

        if (!passwordFound) {
            console.log('\n⚠️  Aucun des mots de passe testés n\'est valide.');
            console.log('Vous pouvez réinitialiser le mot de passe avec le script create-admin.js');
        }

        // 3. Vérifier les données pour le dashboard
        console.log('\n📊 Test des données du dashboard...');
        const stats = {
            totalUsers: await prisma.user.count(),
            totalStudents: await prisma.student.count(),
            totalClasses: await prisma.classe.count(),
            totalMessages: await prisma.message.count()
        };

        console.log('Statistiques:');
        console.log(`- Utilisateurs: ${stats.totalUsers}`);
        console.log(`- Étudiants: ${stats.totalStudents}`);
        console.log(`- Classes: ${stats.totalClasses}`);
        console.log(`- Messages: ${stats.totalMessages}`);

        console.log('\n✅ Test terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminConnection();
