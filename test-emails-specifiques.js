const emailService = require('./src/services/emailService');

/**
 * TEST SIMPLE DES EMAILS AVEC VOS ADRESSES SPÉCIFIQUES
 * - sgdigitalweb13@gmail.com pour l'admin
 * - sebcecg@gmail.com pour le parent
 */

async function testEmailsSpecifiques() {
    console.log('📧 === TEST EMAILS SPÉCIFIQUES ===');
    console.log('=================================\n');

    const ADMIN_EMAIL = 'sgdigitalweb13@gmail.com';
    const PARENT_EMAIL = 'sebcecg@gmail.com';

    try {
        console.log('🔧 TEST 1: Configuration du service email...');

        // Vérifier la configuration
        console.log('   📝 Variables d\'environnement:');
        console.log(`      EMAIL_USER: ${process.env.EMAIL_USER || 'NON DÉFINI'}`);
        console.log(`      EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'NON DÉFINI'}`);
        console.log(`      TEST_MODE: ${process.env.TEST_MODE || 'false'}`);
        console.log(`      TEST_EMAIL: ${process.env.TEST_EMAIL || 'NON DÉFINI'}`);

        // Test de connexion
        console.log('\n   🔌 Test de connexion SMTP...');
        try {
            const connectionTest = await emailService.testConnection();
            if (connectionTest) {
                console.log('   ✅ Connexion SMTP réussie !');
            } else {
                console.log('   ❌ Problème de connexion SMTP');
            }
        } catch (connError) {
            console.log('   ❌ Erreur de connexion:', connError.message);
        }

        console.log('\n📤 TEST 2: Email notification admin (nouvelle demande)...');

        const nouvelleDemandeData = {
            requestId: 'TEST_001',
            parentName: 'Sébastien Test Parent',
            parentEmail: PARENT_EMAIL,
            parentPhone: '0123456789',
            children: [
                { firstName: 'Emma', lastName: 'Test', birthDate: '2018-05-15' },
                { firstName: 'Lucas', lastName: 'Test', birthDate: '2020-09-22' }
            ],
            createdAt: new Date()
        };

        console.log(`   📧 Destinataire admin: ${ADMIN_EMAIL}`);
        console.log(`   👤 Parent demandeur: ${nouvelleDemandeData.parentName}`);
        console.log(`   👶 Enfants: ${nouvelleDemandeData.children.length}`);
        console.log('   📝 Préparation de l\'email...');

        // Ici vous pouvez décommenter pour envoyer l'email réel
        /*
        try {
            const adminNotificationResult = await emailService.sendNewInscriptionNotification({
                adminEmail: ADMIN_EMAIL,
                ...nouvelleDemandeData
            });
            
            if (adminNotificationResult.success) {
                console.log('   ✅ Email admin envoyé avec succès !');
                console.log(`   📬 Message ID: ${adminNotificationResult.messageId}`);
            } else {
                console.log('   ❌ Erreur envoi admin:', adminNotificationResult.error);
            }
        } catch (emailError) {
            console.log('   ❌ Erreur technique admin:', emailError.message);
        }
        */
        console.log('   ✅ Email admin préparé (envoi simulé)');

        console.log('\n📤 TEST 3: Email confirmation parent (inscription approuvée)...');

        const confirmationData = {
            parentFirstName: 'Sébastien',
            parentLastName: 'Test Parent',
            parentEmail: PARENT_EMAIL,
            children: nouvelleDemandeData.children,
            loginCredentials: {
                email: PARENT_EMAIL,
                password: 'VotreMotDePasse123!' // En réalité, c'est celui choisi par le parent
            }
        };

        console.log(`   📧 Destinataire parent: ${PARENT_EMAIL}`);
        console.log(`   👤 Parent: ${confirmationData.parentFirstName} ${confirmationData.parentLastName}`);
        console.log(`   🔑 Email de connexion: ${confirmationData.loginCredentials.email}`);
        console.log('   📝 Préparation de l\'email de confirmation...');

        // Ici vous pouvez décommenter pour envoyer l'email réel
        /*
        try {
            const confirmationResult = await emailService.sendAccountActivatedEmail(confirmationData);
            
            if (confirmationResult.success) {
                console.log('   ✅ Email confirmation envoyé avec succès !');
                console.log(`   📬 Message ID: ${confirmationResult.messageId}`);
            } else {
                console.log('   ❌ Erreur envoi confirmation:', confirmationResult.error);
            }
        } catch (emailError) {
            console.log('   ❌ Erreur technique confirmation:', emailError.message);
        }
        */
        console.log('   ✅ Email confirmation préparé (envoi simulé)');

        console.log('\n📤 TEST 4: Email rappel identifiants...');

        const identifiantsData = {
            parentFirstName: 'Sébastien',
            parentLastName: 'Test Parent',
            parentEmail: PARENT_EMAIL,
            loginCredentials: {
                email: PARENT_EMAIL,
                instructions: 'Utilisez votre email et le mot de passe que vous avez choisi lors de l\'inscription'
            }
        };

        console.log(`   📧 Destinataire: ${PARENT_EMAIL}`);
        console.log(`   🔑 Email de connexion: ${identifiantsData.loginCredentials.email}`);
        console.log('   📝 Instructions de connexion incluses');
        console.log('   ✅ Email identifiants préparé (envoi simulé)');

        console.log('\n🎯 === RÉSUMÉ TEST EMAILS ===');
        console.log('===========================');
        console.log('📊 CONFIGURATION:');
        console.log(`   • Service SMTP: ${process.env.EMAIL_SERVICE || 'NON CONFIGURÉ'}`);
        console.log(`   • Compte expéditeur: ${process.env.EMAIL_USER || 'NON CONFIGURÉ'}`);
        console.log(`   • Mode test: ${process.env.TEST_MODE || 'false'}`);
        console.log('');
        console.log('📧 EMAILS PRÉPARÉS:');
        console.log(`   ✅ Admin (${ADMIN_EMAIL}):`);
        console.log('      - Notification nouvelle demande d\'inscription');
        console.log(`   ✅ Parent (${PARENT_EMAIL}):`);
        console.log('      - Confirmation inscription approuvée');
        console.log('      - Rappel identifiants de connexion');
        console.log('');
        console.log('🔧 POUR ACTIVER L\'ENVOI RÉEL:');
        console.log('   1. Vérifiez la configuration EMAIL_USER/EMAIL_PASS');
        console.log('   2. Décommentez les sections d\'envoi dans le code');
        console.log('   3. Relancez le test');
        console.log('===========================');

    } catch (error) {
        console.error('\n❌ Erreur durant le test emails:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Test de la configuration seule
async function testConfigurationEmail() {
    console.log('🔧 === TEST RAPIDE CONFIGURATION EMAIL ===\n');

    console.log('📝 Variables d\'environnement:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Défini' : '❌ Manquant'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Défini' : '❌ Manquant'}`);
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail (par défaut)'}`);
    console.log(`   TEST_MODE: ${process.env.TEST_MODE || 'false'}`);
    console.log(`   TEST_EMAIL: ${process.env.TEST_EMAIL || 'Non défini'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n⚠️ CONFIGURATION INCOMPLÈTE');
        console.log('💡 Ajoutez dans votre fichier .env:');
        console.log('   EMAIL_USER=votre.email@gmail.com');
        console.log('   EMAIL_PASS=votre_mot_de_passe_application');
        console.log('   TEST_MODE=true');
        console.log('   TEST_EMAIL=sgdigitalweb13@gmail.com');
    } else {
        console.log('\n✅ Configuration complète !');

        try {
            console.log('\n🔌 Test de connexion...');
            const connectionOk = await emailService.testConnection();

            if (connectionOk) {
                console.log('✅ Connexion SMTP réussie !');
                console.log('🚀 Prêt à envoyer des emails');
            } else {
                console.log('❌ Problème de connexion SMTP');
            }
        } catch (error) {
            console.log('❌ Erreur connexion:', error.message);
        }
    }
}

// Choix du test selon l'argument
const args = process.argv.slice(2);
const testType = args[0] || 'full';

if (require.main === module) {
    switch (testType) {
        case 'config':
            testConfigurationEmail();
            break;
        case 'full':
        default:
            testEmailsSpecifiques();
            break;
    }
}

module.exports = { testEmailsSpecifiques, testConfigurationEmail };
