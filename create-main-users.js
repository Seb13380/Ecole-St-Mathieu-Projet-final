// Script pour créer les utilisateurs principaux du système
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createMainUsers() {
    try {
        console.log('👥 Création des utilisateurs principaux...');

        // Supprimer les anciens utilisateurs s'ils existent
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        'lionel@ecolestmathieu.fr',
                        'frank@ecolestmathieu.fr',
                        'seb@ecolestmathieu.fr',
                        'yamina@ecolestmathieu.fr'
                    ]
                }
            }
        });

        console.log('🗑️ Anciens utilisateurs supprimés');

        // Mots de passe hashés
        const defaultPassword = await bcrypt.hash('Password123!', 10);

        // 1. Lionel - Directeur
        const lionel = await prisma.user.create({
            data: {
                firstName: 'Lionel',
                lastName: 'Directeur',
                email: 'lionel@ecolestmathieu.fr',
                password: defaultPassword,
                role: 'DIRECTION',
                isActive: true,
                emailVerified: true,
                phone: '04.91.XX.XX.XX'
            }
        });
        console.log('✅ Lionel créé - Rôle: DIRECTION');

        // 2. Frank - Gestionnaire du site
        const frank = await prisma.user.create({
            data: {
                firstName: 'Frank',
                lastName: 'Gestionnaire',
                email: 'frank@ecolestmathieu.fr',
                password: defaultPassword,
                role: 'GESTIONNAIRE_SITE',
                isActive: true,
                emailVerified: true,
                phone: '04.91.XX.XX.XX'
            }
        });
        console.log('✅ Frank créé - Rôle: GESTIONNAIRE_SITE');

        // 3. Seb - Admin principal
        const seb = await prisma.user.create({
            data: {
                firstName: 'Seb',
                lastName: 'Admin',
                email: 'seb@ecolestmathieu.fr',
                password: defaultPassword,
                role: 'ADMIN',
                isActive: true,
                emailVerified: true,
                phone: '06.XX.XX.XX.XX'
            }
        });
        console.log('✅ Seb créé - Rôle: ADMIN');

        // 4. Yamina - Secrétaire
        const yamina = await prisma.user.create({
            data: {
                firstName: 'Yamina',
                lastName: 'Secrétaire',
                email: 'yamina@ecolestmathieu.fr',
                password: defaultPassword,
                role: 'SECRETAIRE',
                isActive: true,
                emailVerified: true,
                phone: '04.91.XX.XX.XX'
            }
        });
        console.log('✅ Yamina créée - Rôle: SECRETAIRE');

        console.log('\n📋 Résumé des utilisateurs créés:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👨‍💼 Lionel (${lionel.email}) - DIRECTION`);
        console.log(`🛠️  Frank (${frank.email}) - GESTIONNAIRE_SITE`);
        console.log(`⚙️  Seb (${seb.email}) - ADMIN`);
        console.log(`📝 Yamina (${yamina.email}) - SECRETAIRE`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n🔑 Informations de connexion:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: [voir ci-dessus]');
        console.log('🔒 Mot de passe: Password123!');
        console.log('🌐 URL de connexion: http://localhost:3007/login');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n🎯 Accès aux fonctionnalités:');
        console.log('• Lionel & Seb: Dashboard directeur complet + gestion demandes identifiants');
        console.log('• Frank: Gestion du site web + contenus');
        console.log('• Yamina: Gestion secrétariat + inscriptions');

        console.log('\n🚀 Système prêt pour les tests !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createMainUsers();
