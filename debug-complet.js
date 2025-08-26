// Test de debug complet pour identifier le problème
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugLoginAndDashboard() {
    try {
        console.log('🔍 DEBUGGING COMPLET - LOGIN ET DASHBOARD\n');

        // === TEST 1: Vérification du compte Frank ===
        console.log('1️⃣ Test du compte Frank...');
        const frank = await prisma.user.findUnique({
            where: { email: 'frank@stmathieu.org' }
        });

        if (!frank) {
            console.log('❌ Frank introuvable');
            return;
        }

        console.log(`✅ Frank trouvé - ID: ${frank.id}, Rôle: ${frank.role}`);

        // Test du mot de passe
        const passwordValid = await bcrypt.compare('Frank2025!', frank.password);
        console.log(`🔐 Mot de passe valide: ${passwordValid ? '✅ OUI' : '❌ NON'}`);

        // === TEST 2: Vérification des données dashboard ===
        console.log('\n2️⃣ Test des données dashboard...');

        const stats = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.classe.count(),
            prisma.message.count(),
            prisma.actualite.count(),
            prisma.travaux.count(),
            prisma.inscriptionRequest.count({ where: { status: 'PENDING' } })
        ]);

        console.log('📊 Statistiques:');
        console.log(`   👥 Utilisateurs: ${stats[0]}`);
        console.log(`   👶 Élèves: ${stats[1]}`);
        console.log(`   🏫 Classes: ${stats[2]}`);
        console.log(`   💬 Messages: ${stats[3]}`);
        console.log(`   📢 Actualités: ${stats[4]}`);
        console.log(`   🏗️ Travaux: ${stats[5]}`);
        console.log(`   📝 Inscriptions en attente: ${stats[6]}`);

        // === TEST 3: Simulation de l'authentification ===
        console.log('\n3️⃣ Test de l\'authentification...');

        // Simuler une session utilisateur
        const userSession = {
            id: frank.id,
            firstName: frank.firstName,
            lastName: frank.lastName,
            email: frank.email,
            role: frank.role
        };

        console.log('👤 Session utilisateur simulée:');
        console.log(JSON.stringify(userSession, null, 2));

        // Vérifier les droits d'accès
        const hasAccess = ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'].includes(frank.role);
        console.log(`🔑 Accès dashboard autorisé: ${hasAccess ? '✅ OUI' : '❌ NON'}`);

        // === TEST 4: Test de l'endpoint ===
        console.log('\n4️⃣ Test de l\'endpoint...');
        console.log('🌐 URL de test: http://localhost:3007/directeur/dashboard');
        console.log('🌐 URL de connexion: http://localhost:3007/auth/login');

        console.log('\n📋 RÉSUMÉ:');
        console.log('===========');
        console.log(`✅ Compte Frank: ${frank ? 'Existe' : 'Manquant'}`);
        console.log(`✅ Mot de passe: ${passwordValid ? 'Valide' : 'Invalide'}`);
        console.log(`✅ Rôle: ${frank.role}`);
        console.log(`✅ Accès autorisé: ${hasAccess ? 'Oui' : 'Non'}`);
        console.log(`✅ Données dashboard: Disponibles`);

        console.log('\n🎯 PROCHAINES ÉTAPES:');
        console.log('1. Se connecter avec frank@stmathieu.org / Frank2025!');
        console.log('2. Aller sur /directeur/dashboard');
        console.log('3. Vérifier les logs serveur pour erreurs');

    } catch (error) {
        console.error('❌ Erreur lors du debug:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLoginAndDashboard();
