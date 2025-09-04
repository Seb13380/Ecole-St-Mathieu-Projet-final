#!/usr/bin/env node

/**
 * Script de test pour la demande d'identifiants
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testIdentifiantsRequest() {
    console.log('🔑 TEST DEMANDE D\'IDENTIFIANTS');
    console.log('==============================');

    try {
        // Test 1: Parent existant
        console.log('\n1️⃣ Test pour parent existant...');
        const existingParent = await prisma.user.findFirst({
            where: { role: 'PARENT' }
        });

        if (existingParent) {
            console.log(`   ✅ Parent trouvé: ${existingParent.firstName} ${existingParent.lastName}`);

            // Générer un nouveau mot de passe temporaire
            const tempPassword = 'TempPass' + Math.floor(Math.random() * 1000) + '!';
            const hashedPassword = await bcrypt.hash(tempPassword, 12);

            // Mettre à jour le mot de passe
            await prisma.user.update({
                where: { id: existingParent.id },
                data: { password: hashedPassword }
            });

            // Envoyer l'email
            await emailService.sendCredentialsEmail({
                parentFirstName: existingParent.firstName,
                parentLastName: existingParent.lastName,
                parentEmail: existingParent.email,
                temporaryPassword: tempPassword
            });

            console.log(`   ✅ Identifiants envoyés à: ${existingParent.email}`);
            console.log(`   📧 Mot de passe temporaire: ${tempPassword}`);
        } else {
            console.log('   ⚠️ Aucun parent trouvé en base');
        }

        // Test 2: Création nouveau parent
        console.log('\n2️⃣ Test création nouveau parent...');
        const newParentData = {
            firstName: 'TestParent',
            lastName: 'DemandeID',
            email: 'parent.test@exemple.com',
            phone: '06.00.00.00.00'
        };

        // Supprimer s'il existe déjà
        await prisma.user.deleteMany({
            where: { email: newParentData.email }
        });

        // Créer le nouveau parent
        const tempPassword = 'NewParent123!';
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const newParent = await prisma.user.create({
            data: {
                firstName: newParentData.firstName,
                lastName: newParentData.lastName,
                email: newParentData.email,
                password: hashedPassword,
                role: 'PARENT',
                phone: newParentData.phone
            }
        });

        // Envoyer l'email
        await emailService.sendCredentialsEmail({
            parentFirstName: newParent.firstName,
            parentLastName: newParent.lastName,
            parentEmail: newParent.email,
            temporaryPassword: tempPassword
        });

        console.log(`   ✅ Nouveau parent créé: ${newParent.firstName} ${newParent.lastName}`);
        console.log(`   ✅ Identifiants envoyés à: ${newParent.email}`);
        console.log(`   📧 Mot de passe temporaire: ${tempPassword}`);

        console.log('\n✅ TESTS IDENTIFIANTS TERMINÉS AVEC SUCCÈS !');

    } catch (error) {
        console.error('\n❌ ERREUR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
if (require.main === module) {
    testIdentifiantsRequest().catch(console.error);
}

module.exports = { testIdentifiantsRequest };
