const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function activerEmailsReels() {
    console.log('🔥 ACTIVATION DES EMAILS RÉELS !');
    console.log('=================================');

    try {
        // Test direct avec vos emails
        console.log('📤 Test envoi direct...');

        // Forcer mode réel
        const originalTestMode = process.env.TEST_MODE;
        process.env.TEST_MODE = 'false';

        // Email admin
        const adminData = {
            requestId: 999,
            parentName: 'Sébastien Test',
            parentEmail: 'sebcecg@gmail.com',
            parentPhone: '0123456789',
            children: [{ firstName: 'Emma', lastName: 'Test' }],
            submittedAt: new Date(),
            adminEmail: 'sgdigitalweb13@gmail.com'
        };

        console.log('📧 Envoi à admin: sgdigitalweb13@gmail.com...');
        const adminResult = await emailService.sendNewInscriptionNotification(adminData);

        if (adminResult.success) {
            console.log('✅ EMAIL ADMIN ENVOYÉ !');
            console.log(`📬 Message ID: ${adminResult.messageId}`);
        } else {
            console.log('❌ Erreur admin:', adminResult.error);
        }

        // Email parent
        console.log('📧 Envoi à parent: sebcecg@gmail.com...');
        const parentData = {
            parentFirstName: 'Sébastien',
            parentLastName: 'Test',
            parentEmail: 'sebcecg@gmail.com'
        };

        const parentResult = await emailService.sendAccountActivatedEmail(parentData);

        if (parentResult.success) {
            console.log('✅ EMAIL PARENT ENVOYÉ !');
            console.log(`📬 Message ID: ${parentResult.messageId}`);
        } else {
            console.log('❌ Erreur parent:', parentResult.error);
        }

        // Restaurer
        process.env.TEST_MODE = originalTestMode;

        console.log('\n🎉 EMAILS ACTIVÉS ET ENVOYÉS !');
        console.log('📨 Vérifiez vos boîtes:');
        console.log('   - sgdigitalweb13@gmail.com');
        console.log('   - sebcecg@gmail.com');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

activerEmailsReels();
