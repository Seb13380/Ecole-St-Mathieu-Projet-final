const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

/**
 * 🚀 TEST RAPIDE INSCRIPTION AVEC EMAILS
 * Simulation d'une demande d'inscription via le formulaire
 */

async function testInscriptionAvecEmails() {
    console.log('🚀 === TEST RAPIDE INSCRIPTION AVEC EMAILS ===');
    console.log('==============================================');

    const PARENT_TEST = {
        firstName: 'Jean',
        lastName: 'Dupont Test',
        email: 'sebcecg@gmail.com',
        phone: '0456789123',
        address: '789 Avenue du Test, 13001 Marseille',
        password: 'TestInscription123!'
    };

    const ENFANTS_TEST = [
        {
            firstName: 'Sophie',
            lastName: 'Dupont Test',
            birthDate: '2019-06-10'
        }
    ];

    try {
        // Nettoyage rapide
        console.log('🧹 Nettoyage...');
        await prisma.student.deleteMany({
            where: { firstName: 'Sophie', lastName: 'Dupont Test' }
        });
        await prisma.user.deleteMany({
            where: { email: PARENT_TEST.email, lastName: 'Dupont Test' }
        });
        await prisma.preInscriptionRequest.deleteMany({
            where: { parentEmail: PARENT_TEST.email, parentLastName: 'Dupont Test' }
        });

        console.log('📝 Création demande d\'inscription...');

        // Simuler le processus du contrôleur
        const hashedPassword = await bcrypt.hash(PARENT_TEST.password, 12);

        const inscriptionRequest = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: PARENT_TEST.firstName,
                parentLastName: PARENT_TEST.lastName,
                parentEmail: PARENT_TEST.email,
                parentPhone: PARENT_TEST.phone,
                parentAddress: PARENT_TEST.address,
                parentPassword: hashedPassword,
                children: ENFANTS_TEST
            }
        });

        console.log(`✅ Demande créée (ID: ${inscriptionRequest.id})`);

        // Test email admin
        console.log('\n📧 Test email admin...');
        const adminEmailData = {
            requestId: inscriptionRequest.id,
            parentName: `${PARENT_TEST.firstName} ${PARENT_TEST.lastName}`,
            parentEmail: PARENT_TEST.email,
            parentPhone: PARENT_TEST.phone,
            parentAddress: PARENT_TEST.address,
            children: ENFANTS_TEST,
            submittedAt: inscriptionRequest.submittedAt,
            adminEmail: 'sgdigitalweb13@gmail.com'
        };

        const adminResult = await emailService.sendNewInscriptionNotification(adminEmailData);

        if (adminResult.success) {
            console.log('🎉 ✅ EMAIL ADMIN ENVOYÉ !');
            console.log('📬 Message ID:', adminResult.messageId);
        } else {
            console.log('❌ Erreur admin:', adminResult.error);
        }

        // Test email parent
        console.log('\n📧 Test email parent...');
        const parentEmailData = {
            parentFirstName: PARENT_TEST.firstName,
            parentLastName: PARENT_TEST.lastName,
            parentEmail: PARENT_TEST.email,
            children: ENFANTS_TEST
        };

        const parentResult = await emailService.sendInscriptionConfirmation(parentEmailData);

        if (parentResult.success) {
            console.log('🎉 ✅ EMAIL PARENT ENVOYÉ !');
            console.log('📬 Message ID:', parentResult.messageId);
        } else {
            console.log('❌ Erreur parent:', parentResult.error);
        }

        console.log('\n🎯 === RÉSULTAT ===');
        console.log('==================');
        console.log('✅ Demande d\'inscription créée');
        console.log('📧 Emails envoyés:');
        console.log('   → sgdigitalweb13@gmail.com (admin)');
        console.log('   → sebcecg@gmail.com (parent)');
        console.log('\n📝 Demande ID:', inscriptionRequest.id);
        console.log('💡 Maintenant l\'admin peut approuver via l\'interface');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testInscriptionAvecEmails();
