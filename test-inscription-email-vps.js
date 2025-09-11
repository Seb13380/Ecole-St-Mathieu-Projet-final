const emailService = require('./src/services/emailService');

async function testInscriptionEmail() {
    try {
        console.log('🧪 Test email inscription sur VPS...');
        
        const testData = {
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
        
        console.log('📤 Envoi email avec les données:', testData);
        const result = await emailService.sendNewInscriptionNotification(testData);
        
        if (result.success) {
            console.log('✅ Email envoyé avec succès:', result.messageId);
        } else {
            console.error('❌ Erreur email:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
    
    process.exit(0);
}

testInscriptionEmail();
