const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./src/services/emailService');

async function testInscriptionComplete() {
    try {
        console.log('🔍 Test du processus d\'inscription COMPLET amélioré...\n');

        // 1. Créer une demande d'inscription test
        console.log('1️⃣ Simulation d\'une demande d\'inscription...');

        const inscriptionRequest = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Marie',
                parentLastName: 'Testeur',
                parentEmail: 'sebcecg@gmail.com', // Utilisons une vraie adresse pour voir l'email
                parentPhone: '01 23 45 67 89',
                parentAddress: '123 Rue de l\'École, 75001 Paris',
                children: [
                    {
                        firstName: 'Sophie',
                        lastName: 'Testeur',
                        birthDate: '2015-09-12'
                    }
                ],
                message: 'Test du système d\'inscription automatique'
            }
        });

        console.log(`✅ Demande créée avec ID: ${inscriptionRequest.id}`);

        // 2. Envoi de l'email de confirmation
        console.log('\n2️⃣ Envoi email de confirmation au parent...');

        await emailService.sendConfirmationEmail({
            parentFirstName: inscriptionRequest.parentFirstName,
            parentLastName: inscriptionRequest.parentLastName,
            parentEmail: inscriptionRequest.parentEmail,
            children: inscriptionRequest.children
        });

        console.log('✅ Email de confirmation envoyé');

        // 3. Simulation de l'approbation par l'admin
        console.log('\n3️⃣ Simulation approbation par l\'admin...');

        // Simuler l'approbation via le contrôleur mis à jour
        const request = await prisma.preInscriptionRequest.findUnique({
            where: { id: inscriptionRequest.id }
        });

        // Vérifier si un compte existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: request.parentEmail }
        });

        if (existingUser) {
            console.log('⚠️ Compte existant trouvé, suppression pour le test...');
            await prisma.user.delete({ where: { id: existingUser.id } });
        }

        // Générer un mot de passe temporaire
        const bcrypt = require('bcryptjs');
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Créer le compte parent
        const parentUser = await prisma.user.create({
            data: {
                firstName: request.parentFirstName,
                lastName: request.parentLastName,
                email: request.parentEmail,
                password: hashedPassword,
                role: 'PARENT',
                phone: request.parentPhone,
                adress: request.parentAddress // Attention: c'est "adress" sans "e" dans le schéma
            }
        });

        console.log('✅ Compte parent créé:', request.parentEmail);
        console.log('   Mot de passe temporaire:', tempPassword);

        // Mettre à jour le statut de la demande
        await prisma.preInscriptionRequest.update({
            where: { id: inscriptionRequest.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                processedBy: 6, // ID de Lionel
                adminNotes: 'Test automatique - Demande approuvée'
            }
        });

        console.log('✅ Demande marquée comme approuvée');

        // 4. Envoi des identifiants
        console.log('\n4️⃣ Envoi des identifiants au parent...');

        await emailService.sendCredentials({
            parentFirstName: request.parentFirstName,
            parentLastName: request.parentLastName,
            parentEmail: request.parentEmail,
            tempPassword: tempPassword
        });

        console.log('✅ Identifiants envoyés par email');

        // 5. Test du nouveau parent dans la liste
        console.log('\n5️⃣ Vérification de la liste des parents...');

        const allParents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        console.log(`📊 Total des parents: ${allParents.length}`);
        allParents.forEach(parent => {
            console.log(`   - ${parent.email} (${parent.firstName} ${parent.lastName})`);
        });

        console.log('\n✅ PROCESSUS COMPLET TESTÉ AVEC SUCCÈS !');
        console.log('📧 Vérifiez votre boîte email pour voir les notifications');
        console.log(`🔑 Mot de passe temporaire pour ${request.parentEmail}: ${tempPassword}`);

        // Note: Pas de nettoyage automatique pour permettre le test de connexion

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testInscriptionComplete();
