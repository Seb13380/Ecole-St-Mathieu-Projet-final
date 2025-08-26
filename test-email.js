const emailService = require('./src/services/emailService');

async function testEmailService() {
    console.log('🧪 Test du service email...\n');

    // Test de la connexion
    console.log('1. Test de la configuration...');
    const isConnected = await emailService.testConnection();

    if (!isConnected) {
        console.log('❌ La configuration email n\'est pas valide');
        console.log('💡 Vérifiez vos variables EMAIL_USER et EMAIL_PASS dans .env');
        return;
    }

    // Test d'envoi d'email de confirmation
    console.log('\n2. Test d\'envoi d\'email de confirmation...');
    const testData = {
        parentFirstName: 'Jean',
        parentLastName: 'Dupont',
        parentEmail: 'test@example.com', // Changez par votre email pour tester
        children: [
            {
                firstName: 'Marie',
                lastName: 'Dupont',
                birthDate: '2015-09-15'
            },
            {
                firstName: 'Pierre',
                lastName: 'Dupont',
                birthDate: '2017-03-22'
            }
        ]
    };

    try {
        const result = await emailService.sendConfirmationEmail(testData);
        if (result.success) {
            console.log('✅ Email de confirmation envoyé avec succès !');
            console.log('📧 Message ID:', result.messageId);
        } else {
            console.log('❌ Erreur:', result.error);
        }
    } catch (error) {
        console.log('❌ Erreur lors du test:', error.message);
    }

    console.log('\n✨ Test terminé !');
}

// Lancer le test
testEmailService();
