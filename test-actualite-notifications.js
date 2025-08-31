const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testActualiteNotifications() {
    console.log('🧪 Test des notifications d\'actualités aux parents...\n');

    try {
        // 1. Vérifier la configuration email
        console.log('1. Test de la configuration email...');
        const isEmailConfigured = await emailService.testConnection();

        if (!isEmailConfigured) {
            console.log('❌ Configuration email invalide');
            return;
        }

        // 2. Vérifier les parents dans la base de données
        console.log('\n2. Recherche des parents dans la base de données...');
        const parents = await prisma.user.findMany({
            where: {
                role: 'PARENT'
            },
            select: {
                email: true,
                firstName: true,
                lastName: true
            }
        });

        console.log(`📊 ${parents.length} parent(s) trouvé(s):`);
        parents.forEach((parent, index) => {
            console.log(`   ${index + 1}. ${parent.firstName} ${parent.lastName} - ${parent.email}`);
        });

        if (parents.length === 0) {
            console.log('\n⚠️ Aucun parent trouvé dans la base de données.');
            console.log('💡 Conseil: Créez au moins un utilisateur avec le rôle PARENT pour tester les notifications.');
            return;
        }

        // 3. Récupérer une actualité récente pour test
        console.log('\n3. Recherche d\'une actualité récente...');
        const actualite = await prisma.actualite.findFirst({
            where: { visible: true },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { datePublication: 'desc' }
        });

        if (!actualite) {
            console.log('❌ Aucune actualité visible trouvée');
            console.log('💡 Créez une actualité visible depuis l\'interface d\'administration pour tester');
            return;
        }

        console.log(`📰 Actualité trouvée: "${actualite.titre}"`);
        console.log(`   📝 Auteur: ${actualite.auteur.firstName} ${actualite.auteur.lastName}`);
        console.log(`   📅 Date: ${actualite.datePublication.toLocaleDateString('fr-FR')}`);
        console.log(`   🚨 Importante: ${actualite.important ? 'Oui' : 'Non'}`);

        // 4. Test d'envoi de notification
        console.log('\n4. Test d\'envoi de notification...');

        const parentEmails = parents.map(parent => parent.email);

        const emailResult = await emailService.sendNewActualiteNotification({
            titre: actualite.titre,
            contenu: actualite.contenu,
            auteur: actualite.auteur,
            datePublication: actualite.datePublication,
            important: actualite.important,
            mediaUrl: actualite.mediaUrl
        }, parentEmails);

        if (emailResult.success) {
            console.log(`✅ Test réussi !`);
            console.log(`📧 Notification envoyée à ${emailResult.recipientCount} parent(s)`);
            console.log(`📨 Message ID: ${emailResult.messageId}`);

            if (process.env.TEST_MODE === 'true') {
                console.log(`🧪 Mode test activé - Email redirigé vers: ${process.env.TEST_EMAIL}`);
            }
        } else {
            console.log(`❌ Échec du test: ${emailResult.error}`);
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
        console.log('\n✨ Test terminé !');
    }
}

// Fonction pour créer un parent de test si nécessaire
async function createTestParent() {
    console.log('👨‍👩‍👧‍👦 Création d\'un parent de test...\n');

    try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('Parent2025!', 10);

        const testParent = await prisma.user.create({
            data: {
                firstName: 'Jean',
                lastName: 'Dupont',
                email: process.env.TEST_EMAIL || 'parent.test@example.com',
                password: hashedPassword,
                phone: '06.12.34.56.78',
                adress: '123 Rue des Parents',
                role: 'PARENT'
            }
        });

        console.log('✅ Parent de test créé:');
        console.log(`   👤 Nom: ${testParent.firstName} ${testParent.lastName}`);
        console.log(`   📧 Email: ${testParent.email}`);
        console.log(`   🔑 Mot de passe: Parent2025!`);

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️ Un parent avec cet email existe déjà');
        } else {
            console.error('❌ Erreur lors de la création du parent de test:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--create-parent')) {
    createTestParent();
} else {
    testActualiteNotifications();
}
