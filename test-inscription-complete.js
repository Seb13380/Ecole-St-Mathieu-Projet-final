/**
 * Test complet du système d'inscription avec emails
 * Ce script teste tout le workflow : 
 * 1. Création de demande d'inscription
 * 2. Envoi email de confirmation
 * 3. Approbation admin
 * 4. Création automatique des comptes
 * 5. Envoi des identifiants
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testCompletInscription() {
    try {
        console.log('🚀 Test complet du système d\'inscription avec emails');
        console.log('📧 Mode test activé - tous les emails seront envoyés à:', process.env.TEST_EMAIL);

        // 1. Créer une demande d'inscription test
        console.log('\n1️⃣ Création d\'une demande d\'inscription...');

        const timestamp = Date.now();
        const testInscription = {
            parentFirstName: 'Test',
            parentLastName: 'Parent',
            parentEmail: `parent.test.${timestamp}@example.com`, // Email unique pour chaque test
            parentPhone: '0612345678',
            parentAddress: '123 Rue de Test, 13000 Marseille',
            children: [
                {
                    firstName: 'Emma',
                    lastName: 'Test',
                    birthDate: new Date('2015-05-15'),
                    currentClass: 'CP',
                    desiredClass: 'CE1'
                },
                {
                    firstName: 'Lucas',
                    lastName: 'Test',
                    birthDate: new Date('2017-08-22'),
                    currentClass: 'Maternelle',
                    desiredClass: 'GS'
                }
            ],
            additionalInfo: 'Test complet du système d\'inscription avec emails automatiques.'
        };

        // Créer la demande en base
        const bcrypt = require('bcryptjs');
        const tempParentPassword = Math.random().toString(36).slice(-8);
        const hashedParentPassword = await bcrypt.hash(tempParentPassword, 10);

        const inscription = await prisma.inscriptionRequest.create({
            data: {
                parentFirstName: testInscription.parentFirstName,
                parentLastName: testInscription.parentLastName,
                parentEmail: testInscription.parentEmail,
                parentPhone: testInscription.parentPhone,
                parentAddress: testInscription.parentAddress,
                password: hashedParentPassword,
                children: JSON.stringify(testInscription.children),
                status: 'PENDING'
            }
        });

        console.log('✅ Demande créée avec l\'ID:', inscription.id);

        // 2. Envoyer l'email de confirmation
        console.log('\n2️⃣ Envoi de l\'email de confirmation...');

        try {
            await emailService.sendConfirmationEmail({
                ...testInscription,
                requestId: inscription.id
            });
            console.log('✅ Email de confirmation envoyé !');
        } catch (emailError) {
            console.log('❌ Erreur lors de l\'envoi de l\'email de confirmation:', emailError.message);
            console.log('💡 Vérifiez votre configuration EMAIL_PASS dans le fichier .env');
        }

        // 3. Simuler l'approbation par l'admin
        console.log('\n3️⃣ Simulation de l\'approbation par l\'administrateur...');

        // Approuver la demande
        await prisma.inscriptionRequest.update({
            where: { id: inscription.id },
            data: {
                status: 'APPROVED',
                reviewedAt: new Date()
            }
        }); console.log('✅ Demande approuvée en base de données');

        // 4. Créer automatiquement les comptes utilisateur
        console.log('\n4️⃣ Création automatique des comptes utilisateur...');

        try {
            // Générer un mot de passe temporaire pour les comptes créés
            const newTempPassword = Math.random().toString(36).slice(-8);
            const newHashedPassword = await bcrypt.hash(newTempPassword, 10);            // Créer le compte parent
            const parentUser = await prisma.user.create({
                data: {
                    email: testInscription.parentEmail,
                    firstName: testInscription.parentFirstName,
                    lastName: testInscription.parentLastName,
                    password: newHashedPassword,
                    role: 'PARENT',
                    phone: testInscription.parentPhone,
                    adress: testInscription.parentAddress
                }
            });

            console.log('✅ Compte parent créé - ID:', parentUser.id);

            // Créer les comptes des enfants (students seulement, pas d'utilisateurs séparés)
            const studentAccounts = [];
            for (const child of testInscription.children) {

                // Trouver une classe par défaut ou créer
                let classe = await prisma.classe.findFirst({
                    where: { nom: child.desiredClass }
                });

                if (!classe) {
                    // Créer une classe par défaut
                    classe = await prisma.classe.create({
                        data: {
                            nom: child.desiredClass,
                            niveau: child.desiredClass,
                            anneeScolaire: '2024-2025'
                        }
                    });
                }

                const student = await prisma.student.create({
                    data: {
                        firstName: child.firstName,
                        lastName: child.lastName,
                        dateNaissance: child.birthDate,
                        classeId: classe.id,
                        parentId: parentUser.id
                    }
                });

                studentAccounts.push({
                    student: student,
                    tempPassword: newTempPassword
                });

                console.log(`✅ Étudiant créé pour ${child.firstName} - ID: ${student.id}`);
            }

            // 5. Envoyer les identifiants par email
            console.log('\n5️⃣ Envoi des identifiants de connexion...');

            try {
                await emailService.sendApprovalEmail({
                    ...testInscription,
                    parentCredentials: {
                        email: parentUser.email,
                        password: newTempPassword
                    },
                    studentCredentials: studentAccounts.map(acc => ({
                        firstName: acc.student.firstName,
                        lastName: acc.student.lastName,
                        info: `Étudiant en ${acc.student.classeId}`
                    }))
                });
                console.log('✅ Email avec identifiants envoyé !');
            } catch (emailError) {
                console.log('❌ Erreur lors de l\'envoi des identifiants:', emailError.message);
            }

            // 6. Résumé du test
            console.log('\n🎉 TEST COMPLET TERMINÉ !');
            console.log('='.repeat(50));
            console.log('📊 Résumé du test :');
            console.log(`• Demande d'inscription ID: ${inscription.id}`);
            console.log(`• Compte parent créé: ${parentUser.email}`);
            console.log(`• Mot de passe temporaire: ${newTempPassword}`);
            console.log(`• Nombre d'enfants inscrits: ${studentAccounts.length}`);

            console.log('\n👥 Étudiants créés :');
            studentAccounts.forEach((acc, index) => {
                console.log(`  ${index + 1}. ${acc.student.firstName} ${acc.student.lastName}`);
                console.log(`     ID Étudiant: ${acc.student.id}`);
                console.log(`     Date de naissance: ${acc.student.dateNaissance.toLocaleDateString('fr-FR')}`);
                console.log(`     Classe ID: ${acc.student.classeId}`);
            });

            if (process.env.TEST_MODE === 'true') {
                console.log(`\n📧 Vérifiez votre boîte email : ${process.env.TEST_EMAIL}`);
                console.log('   Vous devriez avoir reçu 2 emails :');
                console.log('   1. Confirmation de demande d\'inscription');
                console.log('   2. Identifiants de connexion');
            }

        } catch (accountError) {
            console.log('❌ Erreur lors de la création des comptes:', accountError.message);
        }

    } catch (error) {
        console.error('❌ Erreur générale du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Lancer le test
if (require.main === module) {
    testCompletInscription();
}

module.exports = { testCompletInscription };
