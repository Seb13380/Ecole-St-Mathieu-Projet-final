const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./src/services/emailService');
const bcrypt = require('bcryptjs');

async function testInscriptionProcess() {
    try {
        console.log('🔍 Test du processus d\'inscription complet...\n');

        // 1. Créer une demande d'inscription test (sans password car pas dans le schéma)
        console.log('1️⃣ Création d\'une demande d\'inscription test...');

        const inscriptionRequest = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Jean',
                parentLastName: 'Test',
                parentEmail: 'jean.test@example.com',
                parentPhone: '01 23 45 67 89',
                parentAddress: '123 Rue de Test, 75001 Paris',
                children: [
                    {
                        firstName: 'Emma',
                        lastName: 'Test',
                        birthDate: '2015-05-15'
                    },
                    {
                        firstName: 'Lucas',
                        lastName: 'Test',
                        birthDate: '2017-03-20'
                    }
                ],
                message: 'Demande d\'inscription test'
            }
        });

        console.log(`✅ Demande créée avec ID: ${inscriptionRequest.id}`);

        // 2. Vérifier les emails de confirmation
        console.log('\n2️⃣ Test notification de nouvelle demande...');

        // Simuler l'envoi d'email de confirmation au parent
        await emailService.sendConfirmationEmail({
            parentFirstName: inscriptionRequest.parentFirstName,
            parentLastName: inscriptionRequest.parentLastName,
            parentEmail: inscriptionRequest.parentEmail,
            children: inscriptionRequest.children
        });

        console.log('✅ Email de confirmation envoyé au parent');

        // 3. Récupérer toutes les demandes en attente
        console.log('\n3️⃣ Vérification des demandes en attente...');

        const pendingRequests = await prisma.preInscriptionRequest.findMany({
            where: { status: 'PENDING' }
        });

        console.log(`📊 ${pendingRequests.length} demande(s) en attente trouvée(s)`);

        // 4. Approuver la demande (simulation admin)
        console.log('\n4️⃣ Approbation de la demande...');

        await prisma.preInscriptionRequest.update({
            where: { id: inscriptionRequest.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                processedBy: 6, // ID de Lionel
                adminNotes: 'Demande approuvée - test automatique'
            }
        });

        console.log('✅ Demande approuvée');

        // 5. Vérifier s'il y a création automatique du compte parent
        console.log('\n5️⃣ Vérification de la création de compte parent...');

        const parentUser = await prisma.user.findUnique({
            where: { email: inscriptionRequest.parentEmail }
        });

        if (parentUser) {
            console.log('✅ Compte parent créé automatiquement');
            console.log(`   - Email: ${parentUser.email}`);
            console.log(`   - Rôle: ${parentUser.role}`);
        } else {
            console.log('❌ PROBLÈME: Aucun compte parent créé automatiquement');
            console.log('   ➡️ Il faut implémenter la création automatique du compte');
        }

        // 6. Test de l'envoi des identifiants
        if (parentUser) {
            console.log('\n6️⃣ Test envoi des identifiants...');

            await emailService.sendCredentials({
                parentFirstName: inscriptionRequest.parentFirstName,
                parentLastName: inscriptionRequest.parentLastName,
                parentEmail: inscriptionRequest.parentEmail
            });

            console.log('✅ Identifiants envoyés');
        }

        // 7. Nettoyage
        console.log('\n7️⃣ Nettoyage...');

        if (parentUser) {
            await prisma.user.delete({ where: { id: parentUser.id } });
            console.log('🗑️ Compte parent test supprimé');
        }

        await prisma.preInscriptionRequest.delete({ where: { id: inscriptionRequest.id } });
        console.log('🗑️ Demande d\'inscription test supprimée');

        console.log('\n✅ Test terminé !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testInscriptionProcess();
