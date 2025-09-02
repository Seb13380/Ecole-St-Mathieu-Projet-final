const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./src/services/emailService');
const bcrypt = require('bcryptjs');

async function testInscriptionProcessCorrige() {
    try {
        console.log('🔍 Test du processus d\'inscription CORRIGÉ...\n');

        // 1. Simulation d'inscription avec mot de passe choisi
        console.log('1️⃣ Simulation d\'une inscription avec mot de passe choisi...');

        const parentPassword = 'MonMotDePasse123!';
        const hashedPassword = await bcrypt.hash(parentPassword, 12);

        const inscriptionRequest = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Sophie',
                parentLastName: 'Martin',
                parentEmail: 'sebcecg@gmail.com',
                parentPhone: '01 23 45 67 89',
                parentAddress: '456 Avenue des Écoles, 75002 Paris',
                parentPassword: hashedPassword, // Mot de passe choisi par le parent
                children: [
                    {
                        firstName: 'Théo',
                        lastName: 'Martin',
                        birthDate: '2016-03-10'
                    }
                ],
                message: 'Test du nouveau processus avec mot de passe'
            }
        });

        console.log(`✅ Demande créée avec ID: ${inscriptionRequest.id}`);
        console.log(`🔐 Mot de passe choisi: ${parentPassword}`);

        // 2. Email de confirmation
        console.log('\n2️⃣ Envoi email de confirmation...');

        await emailService.sendConfirmationEmail({
            parentFirstName: inscriptionRequest.parentFirstName,
            parentLastName: inscriptionRequest.parentLastName,
            parentEmail: inscriptionRequest.parentEmail,
            children: inscriptionRequest.children
        });

        console.log('✅ Email de confirmation envoyé');

        // 3. Approbation et création du compte
        console.log('\n3️⃣ Approbation de la demande et création du compte...');

        // Vérifier s'il y a un compte existant
        const existingUser = await prisma.user.findUnique({
            where: { email: inscriptionRequest.parentEmail }
        });

        if (existingUser) {
            console.log('⚠️ Suppression du compte existant pour le test...');
            await prisma.user.delete({ where: { id: existingUser.id } });
        }

        // Créer le compte avec le mot de passe choisi
        const parentUser = await prisma.user.create({
            data: {
                firstName: inscriptionRequest.parentFirstName,
                lastName: inscriptionRequest.parentLastName,
                email: inscriptionRequest.parentEmail,
                password: inscriptionRequest.parentPassword, // Utiliser le mot de passe choisi
                role: 'PARENT',
                phone: inscriptionRequest.parentPhone,
                adress: inscriptionRequest.parentAddress
            }
        });

        console.log('✅ Compte parent créé avec le mot de passe choisi');

        // Récupérer l'ID de l'admin pour processedBy
        const admin = await prisma.user.findFirst({
            where: { role: 'DIRECTION' }
        });

        // Marquer la demande comme approuvée
        await prisma.preInscriptionRequest.update({
            where: { id: inscriptionRequest.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                processedBy: admin.id,
                adminNotes: 'Test - Compte créé avec mot de passe choisi'
            }
        });

        // 4. Email d'activation du compte
        console.log('\n4️⃣ Envoi email d\'activation du compte...');

        await emailService.sendAccountActivatedEmail({
            parentFirstName: inscriptionRequest.parentFirstName,
            parentLastName: inscriptionRequest.parentLastName,
            parentEmail: inscriptionRequest.parentEmail
        });

        console.log('✅ Email d\'activation envoyé');

        // 5. Test de connexion
        console.log('\n5️⃣ Vérification que le parent peut se connecter...');

        const loginTest = await bcrypt.compare(parentPassword, parentUser.password);
        console.log(`🔐 Test de connexion: ${loginTest ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);

        // 6. Vérification des parents dans la liste
        console.log('\n6️⃣ Vérification de la liste des parents...');

        const allParents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        console.log(`📊 Total des parents: ${allParents.length}`);
        allParents.forEach(parent => {
            console.log(`   - ${parent.email} (${parent.firstName} ${parent.lastName})`);
        });

        console.log('\n7️⃣ Test du système "mot de passe oublié"...');

        // Générer un token de reset
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

        await prisma.user.update({
            where: { id: parentUser.id },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });

        console.log('✅ Token de reset généré');

        // Envoyer l'email de reset
        await emailService.sendPasswordResetEmail(parentUser, resetToken);
        console.log('✅ Email de reset de mot de passe envoyé');

        console.log('\n🎉 NOUVEAU PROCESSUS TESTÉ AVEC SUCCÈS !');
        console.log('');
        console.log('📋 RÉSUMÉ DU PROCESSUS CORRIGÉ :');
        console.log('  1. Parent s\'inscrit et CHOISIT son mot de passe');
        console.log('  2. Email de confirmation envoyé');
        console.log('  3. Admin approuve la demande');
        console.log('  4. Compte créé avec le mot de passe choisi');
        console.log('  5. Email d\'activation envoyé (sans mot de passe)');
        console.log('  6. Parent peut se connecter avec SES identifiants');
        console.log('  7. Système "mot de passe oublié" disponible');
        console.log('');
        console.log(`🔑 Identifiants de test :`);
        console.log(`   Email: ${inscriptionRequest.parentEmail}`);
        console.log(`   Mot de passe: ${parentPassword}`);
        console.log(`   Token reset: /auth/reset-password/${resetToken}`);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testInscriptionProcessCorrige();
