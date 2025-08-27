const express = require('express');
const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function createRealInscriptionTest() {
    console.log('🎓 Création d\'une vraie demande d\'inscription de test');
    console.log('=================================================\n');

    try {
        // Données d'une vraie famille pour test
        const realTestInscriptionData = {
            parentFirstName: 'Marie',
            parentLastName: 'Leclerc',
            parentEmail: 'marie.leclerc@example.com', // Email fictif différent
            parentPhone: '0167891234',
            parentAddress: '15 Boulevard des Roses, 75018 Paris',
            password: 'motdepasse2024',
            children: [
                {
                    firstName: 'Thomas',
                    lastName: 'Leclerc',
                    birthDate: new Date('2016-11-25'),
                    currentClass: 'CE1'
                }
            ]
        };

        console.log('1️⃣ Création de la demande d\'inscription...');

        const inscriptionRequest = await prisma.inscriptionRequest.create({
            data: {
                parentFirstName: realTestInscriptionData.parentFirstName,
                parentLastName: realTestInscriptionData.parentLastName,
                parentEmail: realTestInscriptionData.parentEmail,
                parentPhone: realTestInscriptionData.parentPhone,
                parentAddress: realTestInscriptionData.parentAddress,
                password: realTestInscriptionData.password,
                children: JSON.stringify(realTestInscriptionData.children),
                status: 'PENDING'
            }
        });

        console.log('   ✅ Demande créée avec ID:', inscriptionRequest.id);
        console.log('   👨‍👩‍👧‍👦 Parent:', realTestInscriptionData.parentFirstName, realTestInscriptionData.parentLastName);
        console.log('   👶 Enfants:', realTestInscriptionData.children.map(c => `${c.firstName} (${c.currentClass})`).join(', '));

        console.log('\n2️⃣ Envoi notification au directeur (vous)...');

        const notificationResult = await emailService.sendNewRequestNotification(realTestInscriptionData);

        if (notificationResult.success) {
            console.log('   ✅ Notification envoyée à sgdigitalweb13@gmail.com');
            console.log('   📧 Message ID:', notificationResult.messageId);
            console.log('   🔔 Vous devriez recevoir un email avec les détails de la demande');
        } else {
            console.log('   ❌ Erreur notification:', notificationResult.error);
        }

        console.log('\n3️⃣ Envoi confirmation au parent...');

        const confirmationResult = await emailService.sendConfirmationEmail(realTestInscriptionData);

        if (confirmationResult.success) {
            console.log('   ✅ Confirmation envoyée (redirigée vers votre email de test)');
            console.log('   📧 Message ID:', confirmationResult.messageId);
        } else {
            console.log('   ❌ Erreur confirmation:', confirmationResult.error);
        }

        console.log('\n📋 Prochaines étapes pour tester le workflow complet:');
        console.log('=======================================================');
        console.log('1. 📧 Vérifiez votre email sgdigitalweb13@gmail.com');
        console.log('2. 🌐 Connectez-vous à votre interface directeur');
        console.log('3. 📝 Allez dans "Demandes d\'inscription" pour voir la nouvelle demande');
        console.log('4. ✅ Approuvez ou ❌ rejetez la demande avec un commentaire');
        console.log('5. 🔐 Si approuvée, un compte parent sera créé automatiquement');
        console.log('6. 📨 Le parent recevra ses identifiants de connexion');

        console.log('\n🔗 URLs utiles:');
        console.log('================');
        console.log('• Interface directeur: http://localhost:3007/admin/inscriptions');
        console.log('• Page de connexion: http://localhost:3007/auth/login');
        console.log('• Inscription publique: http://localhost:3007/auth/register');
        console.log('• Reset mot de passe: http://localhost:3007/auth/forgot-password');

        console.log('\n📊 Demande créée:');
        console.log(`   ID: ${inscriptionRequest.id}`);
        console.log(`   Statut: ${inscriptionRequest.status}`);
        console.log(`   Date: ${inscriptionRequest.createdAt.toLocaleString('fr-FR')}`);

        return inscriptionRequest.id;

    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Fonction pour simuler l'approbation d'une demande
async function approveInscriptionRequest(requestId) {
    console.log(`✅ Simulation d'approbation de la demande ID: ${requestId}`);
    console.log('=========================================================\n');

    try {
        // Récupérer la demande
        const request = await prisma.inscriptionRequest.findUnique({
            where: { id: parseInt(requestId) }
        });

        if (!request) {
            console.log('❌ Demande introuvable');
            return;
        }

        const inscriptionData = {
            parentFirstName: request.parentFirstName,
            parentLastName: request.parentLastName,
            parentEmail: request.parentEmail,
            parentPhone: request.parentPhone,
            children: JSON.parse(request.children)
        };

        console.log('1️⃣ Mise à jour du statut en APPROVED...');

        await prisma.inscriptionRequest.update({
            where: { id: parseInt(requestId) },
            data: {
                status: 'APPROVED',
                reviewComment: 'Dossier complet et conforme. Nous sommes ravis d\'accueillir votre famille !'
            }
        });

        console.log('   ✅ Statut mis à jour');

        console.log('2️⃣ Envoi email d\'approbation...');

        const approvalResult = await emailService.sendApprovalEmail(
            inscriptionData,
            'Dossier complet et conforme. Nous sommes ravis d\'accueillir votre famille !'
        );

        if (approvalResult.success) {
            console.log('   ✅ Email d\'approbation envoyé');
            console.log('   📧 Message ID:', approvalResult.messageId);
        }

        console.log('3️⃣ Envoi email avec identifiants...');

        const accountData = {
            parentId: 'parent_' + Date.now(),
            studentIds: inscriptionData.children.map((_, index) => `student_${Date.now()}_${index}`)
        };

        const credentialsResult = await emailService.sendAccountCreatedEmail(
            inscriptionData,
            accountData
        );

        if (credentialsResult.success) {
            console.log('   ✅ Email des identifiants envoyé');
            console.log('   📧 Message ID:', credentialsResult.messageId);
        }

        console.log('\n🎉 Simulation d\'approbation terminée !');
        console.log('📧 Vérifiez votre email pour voir tous les messages.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Fonction pour afficher les demandes en attente
async function showPendingRequests() {
    console.log('📋 Demandes d\'inscription en attente');
    console.log('===================================\n');

    try {
        const pendingRequests = await prisma.inscriptionRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });

        if (pendingRequests.length === 0) {
            console.log('📊 Aucune demande en attente');
        } else {
            console.log(`📊 ${pendingRequests.length} demande(s) en attente:`);
            pendingRequests.forEach(req => {
                const children = JSON.parse(req.children);
                console.log(`\n   🆔 ID: ${req.id}`);
                console.log(`   👨‍👩‍👧‍👦 Parent: ${req.parentFirstName} ${req.parentLastName}`);
                console.log(`   📧 Email: ${req.parentEmail}`);
                console.log(`   📞 Téléphone: ${req.parentPhone || 'Non renseigné'}`);
                console.log(`   👶 Enfants: ${children.map(c => `${c.firstName} (${c.currentClass})`).join(', ')}`);
                console.log(`   📅 Demande du: ${req.createdAt.toLocaleString('fr-FR')}`);
            });

            console.log('\n💡 Pour approuver une demande:');
            console.log('   node test-inscription-workflow.js approve [ID]');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Gérer les arguments de ligne de commande
const args = process.argv.slice(2);
const command = args[0] || 'create';
const requestId = args[1];

switch (command) {
    case 'create':
        createRealInscriptionTest();
        break;
    case 'approve':
        if (!requestId) {
            console.log('❌ Veuillez spécifier l\'ID de la demande à approuver');
            console.log('Usage: node test-inscription-workflow.js approve [ID]');
        } else {
            approveInscriptionRequest(requestId);
        }
        break;
    case 'pending':
        showPendingRequests();
        break;
    default:
        console.log('Usage:');
        console.log('  node test-inscription-workflow.js create    - Créer une nouvelle demande de test');
        console.log('  node test-inscription-workflow.js approve [ID] - Approuver une demande spécifique');
        console.log('  node test-inscription-workflow.js pending   - Afficher les demandes en attente');
}
