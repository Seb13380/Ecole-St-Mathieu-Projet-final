const express = require('express');
const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testInscriptionSystem() {
    console.log('🧪 Test du système d\'inscription complet');
    console.log('=====================================\n');

    try {
        // 1. Test de connexion email
        console.log('1️⃣ Test de connexion email...');
        const emailTest = await emailService.testConnection();
        if (emailTest) {
            console.log('   ✅ Service email opérationnel\n');
        } else {
            console.log('   ❌ Problème avec le service email\n');
            return;
        }

        // 2. Simulation d'une demande d'inscription
        console.log('2️⃣ Simulation d\'une demande d\'inscription...');

        const testInscriptionData = {
            parentFirstName: 'Jean',
            parentLastName: 'Dupont',
            parentEmail: 'parent.test@example.com',
            parentPhone: '0123456789',
            parentAddress: '123 Rue de la Paix, 75001 Paris',
            password: 'motdepasse123',
            children: [
                {
                    firstName: 'Emma',
                    lastName: 'Dupont',
                    birthDate: new Date('2015-05-15'),
                    currentClass: 'CP'
                },
                {
                    firstName: 'Lucas',
                    lastName: 'Dupont',
                    birthDate: new Date('2018-08-22'),
                    currentClass: 'Maternelle MS'
                }
            ]
        };

        // 3. Créer la demande d'inscription dans la base
        console.log('3️⃣ Création de la demande en base...');

        const inscriptionRequest = await prisma.inscriptionRequest.create({
            data: {
                parentFirstName: testInscriptionData.parentFirstName,
                parentLastName: testInscriptionData.parentLastName,
                parentEmail: testInscriptionData.parentEmail,
                parentPhone: testInscriptionData.parentPhone,
                parentAddress: testInscriptionData.parentAddress,
                password: testInscriptionData.password,
                children: JSON.stringify(testInscriptionData.children),
                status: 'PENDING'
            }
        });

        console.log('   ✅ Demande créée avec ID:', inscriptionRequest.id);

        // 4. Test email de confirmation au parent
        console.log('4️⃣ Envoi email de confirmation au parent...');
        const confirmationResult = await emailService.sendConfirmationEmail(testInscriptionData);

        if (confirmationResult.success) {
            console.log('   ✅ Email de confirmation envoyé avec succès');
            console.log('   📧 Message ID:', confirmationResult.messageId);
        } else {
            console.log('   ❌ Erreur envoi confirmation:', confirmationResult.error);
        }

        // 5. Test notification au directeur (vous)
        console.log('5️⃣ Envoi notification au directeur...');
        const notificationResult = await emailService.sendNewRequestNotification(testInscriptionData);

        if (notificationResult.success) {
            console.log('   ✅ Notification directeur envoyée avec succès');
            console.log('   📧 Message ID:', notificationResult.messageId);
        } else {
            console.log('   ❌ Erreur notification directeur:', notificationResult.error);
        }

        // 6. Simulation d'approbation
        console.log('6️⃣ Simulation d\'approbation de la demande...');

        // Mettre à jour le statut
        await prisma.inscriptionRequest.update({
            where: { id: inscriptionRequest.id },
            data: {
                status: 'APPROVED',
                reviewComment: 'Dossier complet et conforme. Bienvenue à l\'école !'
            }
        });

        // Email d'approbation
        const approvalResult = await emailService.sendApprovalEmail(
            testInscriptionData,
            'Dossier complet et conforme. Bienvenue à l\'école !'
        );

        if (approvalResult.success) {
            console.log('   ✅ Email d\'approbation envoyé avec succès');
            console.log('   📧 Message ID:', approvalResult.messageId);
        } else {
            console.log('   ❌ Erreur email approbation:', approvalResult.error);
        }

        // 7. Simulation de création de compte parent
        console.log('7️⃣ Simulation de création du compte parent...');

        const accountData = {
            parentId: 'parent_' + Date.now(),
            studentIds: ['student_1', 'student_2']
        };

        const accountCreatedResult = await emailService.sendAccountCreatedEmail(
            testInscriptionData,
            accountData
        );

        if (accountCreatedResult.success) {
            console.log('   ✅ Email des identifiants envoyé avec succès');
            console.log('   📧 Message ID:', accountCreatedResult.messageId);
        } else {
            console.log('   ❌ Erreur email identifiants:', accountCreatedResult.error);
        }

        // 8. Vérifier les demandes en attente
        console.log('8️⃣ Vérification des demandes en base...');

        const pendingRequests = await prisma.inscriptionRequest.findMany({
            where: { status: 'PENDING' }
        });

        const approvedRequests = await prisma.inscriptionRequest.findMany({
            where: { status: 'APPROVED' }
        });

        console.log(`   📊 Demandes en attente: ${pendingRequests.length}`);
        console.log(`   📊 Demandes approuvées: ${approvedRequests.length}`);

        console.log('\n🎉 Test du système d\'inscription terminé avec succès !');
        console.log('\n📧 Vérifiez votre boîte email sgdigitalweb13@gmail.com');
        console.log('   Vous devriez avoir reçu:');
        console.log('   - 1 notification de nouvelle demande');
        console.log('   - 1 confirmation de demande (copie)');
        console.log('   - 1 email d\'approbation (copie)');
        console.log('   - 1 email avec identifiants (copie)');

        // Nettoyage optionnel
        console.log('\n🧹 Nettoyage de la demande de test...');
        await prisma.inscriptionRequest.delete({
            where: { id: inscriptionRequest.id }
        });
        console.log('   ✅ Demande de test supprimée');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Fonction pour tester juste la configuration email
async function testEmailConfig() {
    console.log('📧 Test rapide de la configuration email');
    console.log('=======================================\n');

    const testResult = await emailService.testConnection();

    if (testResult) {
        console.log('✅ Configuration email valide');
        console.log('📧 Serveur: Gmail');
        console.log('📧 Compte:', process.env.EMAIL_USER);
        console.log('🔄 Mode test:', process.env.TEST_MODE === 'true' ? 'ACTIVÉ' : 'DÉSACTIVÉ');
        console.log('📨 Emails redirigés vers:', process.env.TEST_EMAIL);
    } else {
        console.log('❌ Problème de configuration email');
        console.log('💡 Vérifiez:');
        console.log('   - EMAIL_USER dans .env');
        console.log('   - EMAIL_PASS dans .env');
        console.log('   - Connexion internet');
        console.log('   - Autorisation Gmail pour apps moins sécurisées');
    }
}

// Fonction pour afficher l'état actuel des inscriptions
async function showInscriptionStatus() {
    console.log('📊 État actuel du système d\'inscription');
    console.log('=====================================\n');

    try {
        const stats = await prisma.inscriptionRequest.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('📈 Statistiques des demandes:');
        stats.forEach(stat => {
            const status = stat.status === 'PENDING' ? 'En attente' :
                stat.status === 'APPROVED' ? 'Approuvées' :
                    stat.status === 'REJECTED' ? 'Rejetées' : stat.status;
            console.log(`   ${status}: ${stat._count} demande(s)`);
        });

        // Afficher les demandes récentes
        const recentRequests = await prisma.inscriptionRequest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                status: true,
                createdAt: true
            }
        });

        if (recentRequests.length > 0) {
            console.log('\n📋 Dernières demandes:');
            recentRequests.forEach(req => {
                const status = req.status === 'PENDING' ? '⏳' :
                    req.status === 'APPROVED' ? '✅' :
                        req.status === 'REJECTED' ? '❌' : '❓';
                console.log(`   ${status} ${req.parentFirstName} ${req.parentLastName} (${req.parentEmail}) - ${req.createdAt.toLocaleDateString('fr-FR')}`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Gérer les arguments de ligne de commande
const args = process.argv.slice(2);
const command = args[0] || 'test';

switch (command) {
    case 'test':
        testInscriptionSystem();
        break;
    case 'email':
        testEmailConfig();
        break;
    case 'status':
        showInscriptionStatus();
        break;
    default:
        console.log('Usage:');
        console.log('  node test-inscription-system.js test    - Test complet du système');
        console.log('  node test-inscription-system.js email   - Test de configuration email');
        console.log('  node test-inscription-system.js status  - Afficher l\'état des inscriptions');
}
