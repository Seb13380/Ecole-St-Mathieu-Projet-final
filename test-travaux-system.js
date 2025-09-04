#!/usr/bin/env node

/**
 * Script de test pour le système de travaux/devoirs
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function testTravauxSystem() {
    console.log('📚 TEST SYSTÈME TRAVAUX/DEVOIRS');
    console.log('=================================');

    try {
        // Récupérer une classe existante
        let classe = await prisma.classe.findFirst();
        if (!classe) {
            console.log('   ⚠️ Création d\'une classe de test...');
            classe = await prisma.classe.create({
                data: {
                    nom: 'CP-Test',
                    niveau: 'CP'
                }
            });
        }

        console.log(`   ✅ Classe trouvée: ${classe.nom}`);

        // Récupérer un enseignant
        let enseignant = await prisma.user.findFirst({
            where: { role: 'ENSEIGNANT' }
        });

        if (!enseignant) {
            console.log('   ⚠️ Création d\'un enseignant de test...');
            enseignant = await prisma.user.create({
                data: {
                    firstName: 'Prof',
                    lastName: 'Test',
                    email: 'prof.test@exemple.com',
                    password: '$2b$12$test.hash',
                    role: 'ENSEIGNANT'
                }
            });
        }

        console.log(`   ✅ Enseignant trouvé: ${enseignant.firstName} ${enseignant.lastName}`);

        // Test 1: Créer un travail
        console.log('\n1️⃣ Création d\'un travail...');

        const travailData = {
            titre: 'Exercices de mathématiques',
            description: 'Résoudre les exercices pages 45-46 du manuel',
            matiere: 'Mathématiques',
            dateRendu: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
            classeId: classe.id,
            authorId: enseignant.id
        };

        const travail = await prisma.travail.create({
            data: travailData
        });

        console.log(`   ✅ Travail créé: ${travail.titre}`);
        console.log(`   📅 Date de rendu: ${travail.dateRendu.toLocaleDateString()}`);

        // Test 2: Créer un fichier joint
        console.log('\n2️⃣ Test fichier joint...');

        const fichierData = {
            nom: 'exercices_maths.pdf',
            url: '/uploads/travaux/exercices_maths.pdf',
            type: 'application/pdf',
            taille: 1024000, // 1MB
            travailId: travail.id
        };

        const fichier = await prisma.fichierTravail.create({
            data: fichierData
        });

        console.log(`   ✅ Fichier joint créé: ${fichier.nom}`);

        // Test 3: Vérifier les relations
        console.log('\n3️⃣ Vérification des relations...');

        const travailAvecRelations = await prisma.travail.findUnique({
            where: { id: travail.id },
            include: {
                classe: true,
                author: true,
                fichiers: true
            }
        });

        if (travailAvecRelations) {
            console.log(`   ✅ Travail: ${travailAvecRelations.titre}`);
            console.log(`   ✅ Classe: ${travailAvecRelations.classe.nom}`);
            console.log(`   ✅ Auteur: ${travailAvecRelations.author.firstName} ${travailAvecRelations.author.lastName}`);
            console.log(`   ✅ Fichiers: ${travailAvecRelations.fichiers.length} fichier(s)`);
        }

        // Test 4: Lister tous les travaux
        console.log('\n4️⃣ Liste de tous les travaux...');

        const tousLesTravauxDEF = await prisma.travail.findMany({
            include: {
                classe: true,
                author: true,
                _count: {
                    select: { fichiers: true }
                }
            },
            orderBy: { dateCreation: 'desc' }
        });

        console.log(`   ✅ Total: ${tousLesTravauxDEF.length} travaux trouvés`);

        tousLesTravauxDEF.forEach((t, index) => {
            console.log(`   ${index + 1}. ${t.titre} - ${t.classe.nom} - ${t._count.fichiers} fichier(s)`);
        });

        // Test 5: Travaux par classe
        console.log('\n5️⃣ Travaux pour la classe...');

        const travauxClasse = await prisma.travail.findMany({
            where: { classeId: classe.id },
            include: {
                author: true,
                fichiers: true
            }
        });

        console.log(`   ✅ ${travauxClasse.length} travaux pour la classe ${classe.nom}`);

        console.log('\n✅ TESTS TRAVAUX TERMINÉS AVEC SUCCÈS !');

    } catch (error) {
        console.error('\n❌ ERREUR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
if (require.main === module) {
    testTravauxSystem().catch(console.error);
}

module.exports = { testTravauxSystem };
