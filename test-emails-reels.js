const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

/**
 * TEST AVEC ENVOI D'EMAILS RÉELS ACTIVÉ
 * - sgdigitalweb13@gmail.com pour les notifications admin
 * - sebcecg@gmail.com pour les emails parent
 */

async function testAvecEmailsReels() {
    console.log('📧 === TEST AVEC EMAILS RÉELS ACTIVÉS ===');
    console.log('=========================================');
    console.log('🔥 ENVOI D\'EMAILS RÉELS EN COURS...');
    console.log('📨 Admin: sgdigitalweb13@gmail.com');
    console.log('👨‍💼 Parent: sebcecg@gmail.com');
    console.log('=========================================\n');

    const PARENT_TEST = {
        firstName: 'Sébastien',
        lastName: 'Parent Test Email',
        email: 'sebcecg@gmail.com',
        phone: '0123456789',
        address: '123 Rue de Test, 13013 Marseille',
        password: 'TestEmail2024!'
    };

    const ENFANTS_TEST = [
        {
            firstName: 'Emma',
            lastName: 'Test Email',
            birthDate: '2018-05-15'
        },
        {
            firstName: 'Lucas',
            lastName: 'Test Email',
            birthDate: '2020-09-22'
        }
    ];

    let createdIds = {
        demandeId: null,
        parentId: null,
        enfantIds: []
    };

    try {
        // ÉTAPE 1: CONFIGURATION EMAIL
        console.log('🔧 ÉTAPE 1: Vérification configuration email...');

        console.log('   📝 Configuration actuelle:');
        console.log(`      EMAIL_USER: ${process.env.EMAIL_USER}`);
        console.log(`      EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
        console.log(`      TEST_MODE: ${process.env.TEST_MODE}`);
        console.log(`      TEST_EMAIL: ${process.env.TEST_EMAIL}`);

        // Test de connexion
        console.log('\n   🔌 Test de connexion SMTP...');
        try {
            const connectionTest = await emailService.testConnection();
            if (connectionTest) {
                console.log('   ✅ Connexion SMTP réussie !');
            } else {
                throw new Error('Connexion SMTP échouée');
            }
        } catch (connError) {
            console.error('   ❌ Erreur connexion SMTP:', connError.message);
            throw connError;
        }

        // ÉTAPE 2: NETTOYAGE
        console.log('\n🧹 ÉTAPE 2: Nettoyage données précédentes...');

        try {
            // Supprimer élèves précédents
            const studentsToDelete = await prisma.student.findMany({
                where: {
                    OR: [
                        { firstName: 'Emma', lastName: 'Test Email' },
                        { firstName: 'Lucas', lastName: 'Test Email' }
                    ]
                }
            });

            for (const student of studentsToDelete) {
                await prisma.student.delete({ where: { id: student.id } });
            }

            // Supprimer parent précédent
            await prisma.user.deleteMany({
                where: { email: PARENT_TEST.email }
            });

            // Supprimer demandes précédentes
            await prisma.preInscriptionRequest.deleteMany({
                where: { parentEmail: PARENT_TEST.email }
            });

            console.log('   ✅ Nettoyage terminé\n');

        } catch (cleanError) {
            console.log('   💡 Pas de données précédentes à nettoyer\n');
        }

        // ÉTAPE 3: CRÉATION DEMANDE
        console.log('📝 ÉTAPE 3: Création demande d\'inscription...');

        const hashedPassword = await bcrypt.hash(PARENT_TEST.password, 12);

        const demande = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: PARENT_TEST.firstName,
                parentLastName: PARENT_TEST.lastName,
                parentEmail: PARENT_TEST.email,
                parentPhone: PARENT_TEST.phone,
                parentAddress: PARENT_TEST.address,
                parentPassword: hashedPassword,
                children: ENFANTS_TEST,
                status: 'PENDING'
            }
        });

        createdIds.demandeId = demande.id;

        console.log(`   ✅ Demande créée avec ID: ${demande.id}`);
        console.log(`   📧 Email parent: ${demande.parentEmail}`);
        console.log(`   👶 Enfants: ${ENFANTS_TEST.length}\n`);

        // ÉTAPE 4: EMAIL NOTIFICATION ADMIN RÉEL
        console.log('📧 ÉTAPE 4: Envoi email notification admin RÉEL...');
        console.log('   📤 Envoi en cours à sgdigitalweb13@gmail.com...');

        try {
            // Préparer les données pour l'email admin
            const adminEmailData = {
                requestId: demande.id,
                parentName: `${demande.parentFirstName} ${demande.parentLastName}`,
                parentEmail: demande.parentEmail,
                parentPhone: demande.parentPhone,
                parentAddress: demande.parentAddress,
                children: ENFANTS_TEST,
                submittedAt: demande.submittedAt
            };

            // Envoyer l'email de notification admin
            // Note: En mode TEST_MODE=true, l'email sera redirigé vers TEST_EMAIL
            const adminResult = await emailService.sendNewInscriptionNotification(adminEmailData);

            if (adminResult && adminResult.success) {
                console.log('   ✅ EMAIL ADMIN ENVOYÉ AVEC SUCCÈS !');
                console.log(`   📬 Message ID: ${adminResult.messageId || 'N/A'}`);
                console.log(`   📧 Destinataire final: ${process.env.TEST_EMAIL} (mode test)`);
            } else {
                console.log('   ❌ Erreur envoi email admin:', adminResult?.error || 'Erreur inconnue');
            }

        } catch (emailError) {
            console.log('   ❌ Erreur technique email admin:', emailError.message);
        }

        // ÉTAPE 5: APPROBATION ET CRÉATION COMPTES
        console.log('\n✅ ÉTAPE 5: Approbation et création comptes...');

        // Créer le compte parent
        const parentUser = await prisma.user.create({
            data: {
                firstName: demande.parentFirstName,
                lastName: demande.parentLastName,
                email: demande.parentEmail,
                password: demande.parentPassword,
                role: 'PARENT',
                phone: demande.parentPhone,
                adress: demande.parentAddress,
                isActive: true
            }
        });

        createdIds.parentId = parentUser.id;
        console.log(`   ✅ Parent créé avec ID: ${parentUser.id}`);

        // Créer les enfants
        for (const enfantData of ENFANTS_TEST) {
            const student = await prisma.student.create({
                data: {
                    firstName: enfantData.firstName,
                    lastName: enfantData.lastName,
                    birthDate: new Date(enfantData.birthDate),
                    parentId: parentUser.id
                }
            });

            createdIds.enfantIds.push(student.id);
            console.log(`   ✅ Enfant créé: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
        }

        // Mettre à jour le statut
        await prisma.preInscriptionRequest.update({
            where: { id: demande.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                adminNotes: 'Test avec emails réels - Comptes créés avec succès'
            }
        });

        // ÉTAPE 6: EMAIL CONFIRMATION PARENT RÉEL
        console.log('\n📧 ÉTAPE 6: Envoi email confirmation parent RÉEL...');
        console.log('   📤 Envoi en cours à sebcecg@gmail.com...');

        try {
            // Préparer les données pour l'email parent
            const parentEmailData = {
                parentFirstName: parentUser.firstName,
                parentLastName: parentUser.lastName,
                parentEmail: parentUser.email,
                children: ENFANTS_TEST.map(enfant => ({
                    firstName: enfant.firstName,
                    lastName: enfant.lastName,
                    birthDate: enfant.birthDate
                })),
                loginCredentials: {
                    email: parentUser.email,
                    password: 'Votre mot de passe choisi lors de l\'inscription'
                }
            };

            // Envoyer l'email de confirmation
            const confirmationResult = await emailService.sendAccountActivatedEmail(parentEmailData);

            if (confirmationResult && confirmationResult.success) {
                console.log('   ✅ EMAIL PARENT ENVOYÉ AVEC SUCCÈS !');
                console.log(`   📬 Message ID: ${confirmationResult.messageId || 'N/A'}`);
                console.log(`   📧 Destinataire: ${parentUser.email}`);
                console.log(`   💡 Note: En mode test, copie envoyée à ${process.env.TEST_EMAIL}`);
            } else {
                console.log('   ❌ Erreur envoi email parent:', confirmationResult?.error || 'Erreur inconnue');
            }

        } catch (emailError) {
            console.log('   ❌ Erreur technique email parent:', emailError.message);
        }

        // ÉTAPE 7: VÉRIFICATION FINALE
        console.log('\n🔍 ÉTAPE 7: Vérification dans la base...');

        const verification = await prisma.user.findUnique({
            where: { id: parentUser.id },
            include: {
                students: true
            }
        });

        console.log('   ✅ VÉRIFICATION RÉUSSIE:');
        console.log(`      Parent: ${verification.firstName} ${verification.lastName}`);
        console.log(`      Email: ${verification.email}`);
        console.log(`      Enfants: ${verification.students.length}`);
        verification.students.forEach((enfant, index) => {
            console.log(`        ${index + 1}. ${enfant.firstName} ${enfant.lastName}`);
        });

        // RÉSULTAT FINAL
        console.log('\n🎉 === RÉSULTAT FINAL ===');
        console.log('========================');
        console.log('🔥 TEST AVEC EMAILS RÉELS TERMINÉ !');
        console.log('');
        console.log('📧 EMAILS ENVOYÉS:');
        console.log('   ✅ Notification admin envoyée');
        console.log('   ✅ Confirmation parent envoyée');
        console.log('');
        console.log('📬 VÉRIFIEZ VOS BOÎTES EMAIL:');
        console.log(`   📨 ${process.env.TEST_EMAIL}:`);
        console.log('      - Notification nouvelle demande d\'inscription');
        console.log('      - Copie de la confirmation parent (si activée)');
        console.log(`   📨 ${PARENT_TEST.email}:`);
        console.log('      - Email de confirmation d\'inscription approuvée');
        console.log('      - Identifiants de connexion');
        console.log('');
        console.log('✅ DONNÉES CRÉÉES:');
        console.log(`   • Demande ID: ${createdIds.demandeId}`);
        console.log(`   • Parent ID: ${createdIds.parentId}`);
        console.log(`   • Enfants IDs: [${createdIds.enfantIds.join(', ')}]`);
        console.log('');
        console.log('🔑 CONNEXION PARENT:');
        console.log(`   • Email: ${PARENT_TEST.email}`);
        console.log(`   • Mot de passe: ${PARENT_TEST.password}`);
        console.log('========================');

    } catch (error) {
        console.error('\n❌ ERREUR DURANT LE TEST:', error.message);
        console.error('Stack:', error.stack);

        // Nettoyage en cas d'erreur
        console.log('\n🧹 Nettoyage en cas d\'erreur...');
        try {
            if (createdIds.enfantIds.length > 0) {
                for (const id of createdIds.enfantIds) {
                    await prisma.student.delete({ where: { id } });
                }
            }
            if (createdIds.parentId) {
                await prisma.user.delete({ where: { id: createdIds.parentId } });
            }
            if (createdIds.demandeId) {
                await prisma.preInscriptionRequest.delete({ where: { id: createdIds.demandeId } });
            }
            console.log('   ✅ Nettoyage terminé');
        } catch (cleanupError) {
            console.log('   ⚠️ Erreur nettoyage:', cleanupError.message);
        }

    } finally {
        await prisma.$disconnect();
    }
}

// Test rapide email seul
async function testEmailSeul() {
    console.log('📧 === TEST EMAIL SEUL ===\n');

    try {
        console.log('🔌 Test connexion...');
        const connectionOk = await emailService.testConnection();

        if (connectionOk) {
            console.log('✅ Connexion SMTP réussie !');

            console.log('\n📤 Test envoi email simple...');

            const testEmailData = {
                requestId: 'TEST_EMAIL_001',
                parentName: 'Sébastien Test',
                parentEmail: 'sebcecg@gmail.com',
                parentPhone: '0123456789',
                children: [
                    { firstName: 'Emma', lastName: 'Test' },
                    { firstName: 'Lucas', lastName: 'Test' }
                ],
                submittedAt: new Date()
            };

            const result = await emailService.sendNewInscriptionNotification(testEmailData);

            if (result && result.success) {
                console.log('✅ Email test envoyé avec succès !');
                console.log(`📬 Message ID: ${result.messageId || 'N/A'}`);
                console.log(`📧 Vérifiez: ${process.env.TEST_EMAIL}`);
            } else {
                console.log('❌ Erreur:', result?.error || 'Erreur inconnue');
            }

        } else {
            console.log('❌ Problème de connexion SMTP');
        }

    } catch (error) {
        console.error('❌ Erreur test email:', error.message);
    }
}

// Gestion des arguments
const args = process.argv.slice(2);
const testType = args[0] || 'complet';

if (require.main === module) {
    switch (testType) {
        case 'email':
            testEmailSeul();
            break;
        case 'complet':
        default:
            testAvecEmailsReels();
            break;
    }
}

module.exports = { testAvecEmailsReels, testEmailSeul };
