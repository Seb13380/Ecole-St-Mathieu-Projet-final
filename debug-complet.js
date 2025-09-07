// Test de debug complet pour identifier le problÃ¨me
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugLoginAndDashboard() {
    try {
        console.log('ðŸ” DEBUGGING COMPLET - LOGIN ET DASHBOARD\n');

        // === TEST 1: VÃ©rification du compte Frank ===
        console.log('1ï¸âƒ£ Test du compte Frank...');
        const frank = await prisma.user.findUnique({
            where: { email: 'frank@stmathieu.org' }
        });

        if (!frank) {
            console.log('âŒ Frank introuvable');
            return;
        }

        console.log(`âœ… Frank trouvÃ© - ID: ${frank.id}, RÃ´le: ${frank.role}`);

        // Test du mot de passe
        const passwordValid = await bcrypt.compare('Frank2025!', frank.password);
        console.log(`ðŸ” Mot de passe valide: ${passwordValid ? 'âœ… OUI' : 'âŒ NON'}`);

        // === TEST 2: VÃ©rification des donnÃ©es dashboard ===
        console.log('\n2ï¸âƒ£ Test des donnÃ©es dashboard...');

        const stats = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.classe.count(),
            prisma.message.count(),
            prisma.actualite.count(),
            prisma.travaux.count(),
            prisma.inscriptionRequest.count({ where: { status: 'PENDING' } })
        ]);

        console.log('ðŸ“Š Statistiques:');
        console.log(`   ðŸ‘¥ Utilisateurs: ${stats[0]}`);
        console.log(`   ðŸ‘¶ Ã‰lÃ¨ves: ${stats[1]}`);
        console.log(`   ðŸ« Classes: ${stats[2]}`);
        console.log(`   ðŸ’¬ Messages: ${stats[3]}`);
        console.log(`   ðŸ“¢ ActualitÃ©s: ${stats[4]}`);
        console.log(`   ðŸ—ï¸ Travaux: ${stats[5]}`);
        console.log(`   ðŸ“ Inscriptions en attente: ${stats[6]}`);

        // === TEST 3: Simulation de l'authentification ===
        console.log('\n3ï¸âƒ£ Test de l\'authentification...');

        // Simuler une session utilisateur
        const userSession = {
            id: frank.id,
            firstName: frank.firstName,
            lastName: frank.lastName,
            email: frank.email,
            role: frank.role
        };

        console.log('ðŸ‘¤ Session utilisateur simulÃ©e:');
        console.log(JSON.stringify(userSession, null, 2));

        // VÃ©rifier les droits d'accÃ¨s
        const hasAccess = ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'].includes(frank.role);
        console.log(`ðŸ”‘ AccÃ¨s dashboard autorisÃ©: ${hasAccess ? 'âœ… OUI' : 'âŒ NON'}`);

        // === TEST 4: Test de l'endpoint ===
        console.log('\n4ï¸âƒ£ Test de l\'endpoint...');
        console.log('ðŸŒ URL de test: http://localhost:3007/directeur/dashboard');
        console.log('ðŸŒ URL de connexion: http://localhost:3007/auth/login');

        console.log('\nðŸ“‹ RÃ‰SUMÃ‰:');
        console.log('====');
        console.log(`âœ… Compte Frank: ${frank ? 'Existe' : 'Manquant'}`);
        console.log(`âœ… Mot de passe: ${passwordValid ? 'Valide' : 'Invalide'}`);
        console.log(`âœ… RÃ´le: ${frank.role}`);
        console.log(`âœ… AccÃ¨s autorisÃ©: ${hasAccess ? 'Oui' : 'Non'}`);
        console.log(`âœ… DonnÃ©es dashboard: Disponibles`);

        console.log('\nðŸŽ¯ PROCHAINES Ã‰TAPES:');
        console.log('1. Se connecter avec frank@stmathieu.org / Frank2025!');
        console.log('2. Aller sur /directeur/dashboard');
        console.log('3. VÃ©rifier les logs serveur pour erreurs');

    } catch (error) {
        console.error('âŒ Erreur lors du debug:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLoginAndDashboard();

