const emailService = require('./src/services/emailService');

/**
 * TEST RAPIDE EMAIL RÉEL
 * Envoi d'un email de test simple pour vérifier la configuration
 */

async function testEmailRapide() {
    console.log('🚀 === TEST EMAIL RAPIDE ===');
    console.log('============================\n');

    try {
        console.log('🔧 Configuration email:');
        console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
        console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
        console.log(`   TEST_MODE: ${process.env.TEST_MODE}`);
        console.log(`   TEST_EMAIL: ${process.env.TEST_EMAIL}\n`);

        console.log('🔌 Test de connexion SMTP...');
        const connectionOk = await emailService.testConnection();

        if (!connectionOk) {
            throw new Error('Connexion SMTP échouée');
        }

        console.log('✅ Connexion SMTP réussie !\n');

        console.log('📧 Envoi d\'un email de test...');

        // Données de test pour une notification admin
        const testData = {
            requestId: 'TEST_' + Date.now(),
            parentName: 'Sébastien Test',
            parentEmail: 'sebcecg@gmail.com',
            parentPhone: '0123456789',
            parentAddress: '123 Rue de Test, 13013 Marseille',
            children: [
                {
                    firstName: 'Emma',
                    lastName: 'Test',
                    birthDate: '2018-05-15'
                },
                {
                    firstName: 'Lucas',
                    lastName: 'Test',
                    birthDate: '2020-09-22'
                }
            ],
            submittedAt: new Date()
        };

        console.log('📤 Envoi notification admin...');
        console.log(`   Destinataire: ${process.env.TEST_EMAIL}`);
        console.log(`   Parent: ${testData.parentName}`);
        console.log(`   Email parent: ${testData.parentEmail}`);
        console.log(`   Enfants: ${testData.children.length}`);

        const result = await emailService.sendNewInscriptionNotification(testData);

        if (result.success) {
            console.log('\n🎉 SUCCESS !');
            console.log('✅ Email envoyé avec succès !');
            console.log(`📬 Message ID: ${result.messageId}`);
            console.log('');
            console.log('📨 VÉRIFIEZ VOTRE BOÎTE EMAIL:');
            console.log(`   👉 ${process.env.TEST_EMAIL}`);
            console.log('   📧 Sujet: "🔔 Nouvelle demande d\'inscription - École Saint-Mathieu"');
            console.log('');
            console.log('💡 Si vous ne voyez pas l\'email:');
            console.log('   - Vérifiez vos spams/courriers indésirables');
            console.log('   - L\'email peut prendre quelques minutes à arriver');

        } else {
            console.log('\n❌ ÉCHEC');
            console.log('Erreur:', result.error);
        }

    } catch (error) {
        console.error('\n💥 ERREUR:', error.message);
        console.error('Stack:', error.stack);

        if (error.message.includes('Invalid login')) {
            console.log('\n💡 SOLUTIONS POSSIBLES:');
            console.log('   1. Vérifiez EMAIL_USER et EMAIL_PASS dans .env');
            console.log('   2. Assurez-vous d\'utiliser un mot de passe d\'application Gmail');
            console.log('   3. Activez l\'authentification à 2 facteurs sur Gmail');
            console.log('   4. Générez un nouveau mot de passe d\'application');
        }
    }

    console.log('\n============================');
}

// Exécuter le test
if (require.main === module) {
    testEmailRapide();
}

module.exports = testEmailRapide;
