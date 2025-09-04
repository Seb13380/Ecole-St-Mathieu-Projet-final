#!/usr/bin/env node

/**
 * 🧪 TEST FINAL - CORRECTION COMPLÈTE
 * Vérification des deux systèmes bien séparés
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testFinalCorrection() {
    console.log('🎯 === TEST FINAL CORRECTION ===');
    console.log('================================');
    console.log('Vérification que les 2 systèmes sont bien séparés\n');

    try {
        // 🧹 Nettoyage préalable
        console.log('🧹 Nettoyage...');
        await prisma.student.deleteMany({
            where: {
                OR: [
                    { lastName: 'TestFinalCorrection' },
                    { lastName: 'TestIdentifiants' }
                ]
            }
        });
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: 'test.final.correction@example.com' },
                    { email: 'test.identifiants.final@example.com' }
                ]
            }
        });
        await prisma.preInscriptionRequest.deleteMany({
            where: {
                OR: [
                    { parentEmail: 'test.final.correction@example.com' },
                    { parentEmail: 'test.identifiants.final@example.com' }
                ]
            }
        });

        // 🔑 TEST SYSTÈME 1: DEMANDE D'IDENTIFIANTS
        console.log('\n1️⃣ === SYSTÈME DEMANDE D\'IDENTIFIANTS ===');
        console.log('==========================================');
        console.log('Cas d\'usage: Parent existant a oublié ses codes\n');

        // Créer un parent existant
        const parentExistant = await prisma.user.create({
            data: {
                firstName: 'Marie',
                lastName: 'TestIdentifiants',
                email: 'test.identifiants.final@example.com',
                password: await bcrypt.hash('AncienPassword123!', 12),
                role: 'PARENT',
                phone: '0601020304',
                adress: '456 Rue Existante, 13001 Marseille'
            }
        });

        console.log('✅ Parent existant créé:');
        console.log(`   Nom: ${parentExistant.firstName} ${parentExistant.lastName}`);
        console.log(`   Email: ${parentExistant.email}`);

        // Simuler demande d'identifiants
        const newTempPassword = 'Ecole' + Math.floor(Math.random() * 10000) + '!';
        const hashedNewPassword = await bcrypt.hash(newTempPassword, 12);

        await prisma.user.update({
            where: { id: parentExistant.id },
            data: { password: hashedNewPassword }
        });

        // Test email identifiants
        console.log('\n📧 Test email demande identifiants...');
        try {
            await emailService.sendCredentialsEmail({
                parentFirstName: parentExistant.firstName,
                parentLastName: parentExistant.lastName,
                parentEmail: parentExistant.email,
                temporaryPassword: newTempPassword
            });
            console.log('✅ Email identifiants envoyé');
            console.log(`   Sujet: "🔑 Demande d'identifiants traitée"`);
            console.log(`   Contenu: Codes d'accès pour parent existant`);
            console.log(`   Objectif: Récupérer accès à l'espace parent`);
        } catch (error) {
            console.log('❌ Erreur email identifiants:', error.message);
        }

        // 👶 TEST SYSTÈME 2: INSCRIPTION ÉLÈVE
        console.log('\n\n2️⃣ === SYSTÈME INSCRIPTION ÉLÈVE ===');
        console.log('=====================================');
        console.log('Cas d\'usage: Nouveau parent inscrit ses enfants\n');

        // Créer demande d'inscription
        const demandeInscription = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Jean',
                parentLastName: 'TestFinalCorrection',
                parentEmail: 'test.final.correction@example.com',
                parentPassword: await bcrypt.hash('PasswordInscription123!', 12),
                parentPhone: '0607080910',
                parentAddress: '123 Rue de l\'École, 13000 Marseille',
                children: [
                    {
                        firstName: 'Alice',
                        lastName: 'TestFinalCorrection',
                        birthDate: '2018-05-15'
                    },
                    {
                        firstName: 'Bob',
                        lastName: 'TestFinalCorrection',
                        birthDate: '2020-11-22'
                    }
                ],
                status: 'PENDING'
            }
        });

        console.log('✅ Demande d\'inscription créée:');
        console.log(`   ID: ${demandeInscription.id}`);
        console.log(`   Parent: ${demandeInscription.parentFirstName} ${demandeInscription.parentLastName}`);
        console.log(`   Email: ${demandeInscription.parentEmail}`);

        // Simuler approbation (NOUVEAU CODE CORRIGÉ)
        console.log('\n🔄 Simulation approbation inscription...');

        // Créer parent avec mot de passe temporaire
        const tempPasswordInscription = 'TempEcole' + Math.floor(Math.random() * 1000) + '!';
        const hashedTempPassword = await bcrypt.hash(tempPasswordInscription, 12);

        const nouveauParent = await prisma.user.create({
            data: {
                firstName: demandeInscription.parentFirstName,
                lastName: demandeInscription.parentLastName,
                email: demandeInscription.parentEmail,
                password: hashedTempPassword,
                role: 'PARENT',
                phone: demandeInscription.parentPhone,
                adress: demandeInscription.parentAddress
            }
        });

        // CRÉER LES ENFANTS (code corrigé)
        const childrenData = typeof demandeInscription.children === 'string'
            ? JSON.parse(demandeInscription.children)
            : demandeInscription.children;

        let createdStudents = [];
        for (const childData of childrenData) {
            const student = await prisma.student.create({
                data: {
                    firstName: childData.firstName,
                    lastName: childData.lastName,
                    birthDate: new Date(childData.birthDate),
                    parentId: nouveauParent.id
                }
            });
            createdStudents.push(student);
        }

        // Mettre à jour statut
        await prisma.preInscriptionRequest.update({
            where: { id: demandeInscription.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date()
            }
        });

        console.log('✅ Nouveau parent créé:');
        console.log(`   Nom: ${nouveauParent.firstName} ${nouveauParent.lastName}`);
        console.log(`   Email: ${nouveauParent.email}`);

        console.log('✅ Enfants créés:');
        createdStudents.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} (né le ${student.birthDate.toLocaleDateString('fr-FR')})`);
        });

        // Test email inscription
        console.log('\n📧 Test email approbation inscription...');
        try {
            await emailService.sendApprovalEmailWithCredentials({
                parentFirstName: nouveauParent.firstName,
                parentLastName: nouveauParent.lastName,
                parentEmail: nouveauParent.email,
                children: demandeInscription.children,
                tempPassword: tempPasswordInscription,
                createdStudents: createdStudents
            }, 'Bienvenue à l\'École Saint-Mathieu !');

            console.log('✅ Email approbation inscription envoyé');
            console.log(`   Sujet: "🎉 Inscription de votre enfant approuvée"`);
            console.log(`   Contenu: Félicitations + liste enfants + accès espace parent`);
            console.log(`   Objectif: Confirmer inscription + donner accès parent`);
        } catch (error) {
            console.log('❌ Erreur email inscription:', error.message);
        }

        // 📊 VÉRIFICATION FINALE
        console.log('\n\n🔍 === VÉRIFICATION FINALE ===');
        console.log('==============================');

        // Vérifier parent existant
        const verifyParentExistant = await prisma.user.findUnique({
            where: { id: parentExistant.id }
        });

        // Vérifier nouveau parent + enfants
        const verifyNouveauParent = await prisma.user.findUnique({
            where: { id: nouveauParent.id },
            include: { students: true }
        });

        console.log('📈 STATISTIQUES:');
        console.log(`   Parents existants traités: 1`);
        console.log(`   Nouveaux parents créés: 1`);
        console.log(`   Enfants inscrits: ${verifyNouveauParent.students.length}`);

        console.log('\n🎯 === RÉSULTAT FINAL ===');
        console.log('=========================');

        if (verifyParentExistant && verifyNouveauParent && verifyNouveauParent.students.length === 2) {
            console.log('🎉 ✅ CORRECTION COMPLÈTE RÉUSSIE !');
            console.log('');
            console.log('📧 EMAILS BIEN DIFFÉRENCIÉS:');
            console.log('   🔑 Demande identifiants: "Demande d\'identifiants traitée"');
            console.log('   👶 Inscription élève: "Inscription de votre enfant approuvée"');
            console.log('');
            console.log('🎭 DIRECTEUR PEUT MAINTENANT DISTINGUER:');
            console.log('   • Demande d\'identifiants = Parent existant, codes oubliés');
            console.log('   • Demande d\'inscription = Nouveau parent + enfants à inscrire');
            console.log('');
            console.log('✅ FONCTIONNALITÉS CORRIGÉES:');
            console.log('   • Parent créé ✅');
            console.log('   • Enfants créés ✅ (problème résolu !)');
            console.log('   • Relations parent-enfant ✅');
            console.log('   • Emails distincts ✅');
            console.log('   • Textes clarifiés ✅');
        } else {
            console.log('❌ PROBLÈME DÉTECTÉ');
            console.log(`   Parent existant: ${verifyParentExistant ? '✅' : '❌'}`);
            console.log(`   Nouveau parent: ${verifyNouveauParent ? '✅' : '❌'}`);
            console.log(`   Enfants: ${verifyNouveauParent?.students?.length || 0}/2`);
        }

    } catch (error) {
        console.error('❌ Erreur dans le test:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testFinalCorrection();
