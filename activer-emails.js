const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function activerEmailsReels() {
    console.log('ðŸ”¥ ACTIVATION DES EMAILS RÃ‰ELS !');
    console.log('=====');

    try {
        // Test direct avec vos emails
        console.log('ðŸ“¤ Test envoi direct...');

        // Forcer mode rÃ©el
        const originalTestMode = process.env.TEST_MODE;
        process.env.TEST_MODE = 'false';

        // Email admin
        const adminData = {
            requestId: 999,
            parentName: 'SÃ©bastien Test',
            parentEmail: 'sebcecg@gmail.com',
            parentPhone: '0123456789',
            children: [{ firstName: 'Emma', lastName: 'Test' }],
            submittedAt: new Date(),
            adminEmail: 'sgdigitalweb13@gmail.com'
        };

        console.log('ðŸ“§ Envoi Ã  admin: sgdigitalweb13@gmail.com...');
        const adminResult = await emailService.sendNewInscriptionNotification(adminData);

        if (adminResult.success) {
            console.log('âœ… EMAIL ADMIN ENVOYÃ‰ !');
            console.log(`ðŸ“¬ Message ID: ${adminResult.messageId}`);
        } else {
            console.log('âŒ Erreur admin:', adminResult.error);
        }

        // Email parent
        console.log('ðŸ“§ Envoi Ã  parent: sebcecg@gmail.com...');
        const parentData = {
            parentFirstName: 'SÃ©bastien',
            parentLastName: 'Test',
            parentEmail: 'sebcecg@gmail.com'
        };

        const parentResult = await emailService.sendAccountActivatedEmail(parentData);

        if (parentResult.success) {
            console.log('âœ… EMAIL PARENT ENVOYÃ‰ !');
            console.log(`ðŸ“¬ Message ID: ${parentResult.messageId}`);
        } else {
            console.log('âŒ Erreur parent:', parentResult.error);
        }

        // Restaurer
        process.env.TEST_MODE = originalTestMode;

        console.log('\nðŸŽ‰ EMAILS ACTIVÃ‰S ET ENVOYÃ‰S !');
        console.log('ðŸ“¨ VÃ©rifiez vos boÃ®tes:');
        console.log('   - sgdigitalweb13@gmail.com');
        console.log('   - sebcecg@gmail.com');

    } catch (error) {
        console.error('âŒ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

activerEmailsReels();

