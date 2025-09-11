const emailService = require('./src/services/emailService');

async function testBothEmails() {
    try {
        console.log('🧪 Test comparatif emails sur VPS...');
        console.log('📧 Variables d\'environnement:');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Défini' : 'Non défini');

        // Test 1: Email actualité (qui fonctionne)
        console.log('\n1️⃣ Test email actualité...');
        try {
            const actualiteData = {
                titre: 'Test actualité',
                contenu: 'Ceci est un test',
                auteur: 'Test',
                datePublication: new Date(),
                important: false
            };

            const parentEmails = ['sgdigitalweb13@gmail.com'];
            const actualiteResult = await emailService.sendNewActualiteNotification(actualiteData, parentEmails);

            if (actualiteResult.success) {
                console.log('✅ Email actualité envoyé avec succès:', actualiteResult.messageId);
            } else {
                console.log('❌ Email actualité échoué:', actualiteResult.error);
            }
        } catch (error) {
            console.log('❌ Erreur actualité:', error.message);
        }

        // Test 2: Email inscription (qui ne fonctionne pas)
        console.log('\n2️⃣ Test email inscription...');
        try {
            const inscriptionData = {
                requestId: 'TEST-' + Date.now(),
                parentName: 'Test Parent',
                parentEmail: 'parent.test@example.com',
                parentPhone: '06 12 34 56 78',
                parentAddress: '123 Rue Test',
                children: [
                    {
                        firstName: 'Test',
                        lastName: 'Enfant',
                        birthDate: '2015-05-15'
                    }
                ],
                submittedAt: new Date(),
                adminEmail: 'sgdigitalweb13@gmail.com'
            };

            const inscriptionResult = await emailService.sendNewInscriptionNotification(inscriptionData);

            if (inscriptionResult.success) {
                console.log('✅ Email inscription envoyé avec succès:', inscriptionResult.messageId);
            } else {
                console.log('❌ Email inscription échoué:', inscriptionResult.error);
            }
        } catch (error) {
            console.log('❌ Erreur inscription:', error.message);
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }

    process.exit(0);
}

testBothEmails();