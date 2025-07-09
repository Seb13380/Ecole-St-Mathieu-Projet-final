const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fullDiagnostic() {
    try {
        console.log('🔍 DIAGNOSTIC COMPLET DU SYSTÈME\n');
        console.log('='.repeat(50));

        // 1. Test de connexion à la base de données
        console.log('\n1. 📊 Test de connexion à la base de données...');
        const dbConnection = await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Base de données accessible');

        // 2. Vérification des utilisateurs
        console.log('\n2. 👥 Vérification des utilisateurs...');
        const users = await prisma.user.findMany();
        console.log(`📋 Total utilisateurs: ${users.length}`);

        users.forEach(user => {
            console.log(`- ${user.email} (${user.role}) - ID: ${user.id}`);
        });

        // 3. Test spécifique admin
        console.log('\n3. 👑 Test spécifique admin...');
        const admin = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (admin) {
            console.log('✅ Admin trouvé');
            console.log(`- Email: ${admin.email}`);
            console.log(`- Rôle: ${admin.role}`);

            // Test du mot de passe
            const passwordTest = await bcrypt.compare('AdminStMathieu2024!', admin.password);
            console.log(`- Mot de passe correct: ${passwordTest ? '✅' : '❌'}`);
        } else {
            console.log('❌ Admin non trouvé');
        }

        // 4. Test des codes d'invitation
        console.log('\n4. 🎫 Test des codes d\'invitation...');
        try {
            const codes = await prisma.invitationCode.findMany();
            console.log(`📋 Total codes: ${codes.length}`);

            codes.forEach(code => {
                console.log(`- ${code.code} (${code.role}) - Utilisé: ${code.utilise ? 'Oui' : 'Non'}`);
            });
        } catch (error) {
            console.log('⚠️  Problème avec la table InvitationCode:', error.message);
        }

        // 5. Test des tables du dashboard
        console.log('\n5. 📊 Test des données du dashboard...');
        const stats = {
            totalUsers: await prisma.user.count(),
            totalStudents: await prisma.student.count(),
            totalClasses: await prisma.classe.count(),
            totalMessages: await prisma.message.count(),
            totalContacts: await prisma.contact.count()
        };

        console.log('Statistiques:');
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`- ${key}: ${value}`);
        });

        // 6. Test des relations
        console.log('\n6. 🔗 Test des relations...');
        const userWithRelations = await prisma.user.findFirst({
            include: {
                enfants: true,
                _count: {
                    select: {
                        enfants: true,
                        messages: true
                    }
                }
            }
        });

        if (userWithRelations) {
            console.log('✅ Relations fonctionnelles');
            console.log(`- Enfants: ${userWithRelations._count.enfants}`);
            console.log(`- Messages: ${userWithRelations._count.messages}`);
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 DIAGNOSTIC TERMINÉ AVEC SUCCÈS !');

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fullDiagnostic();
