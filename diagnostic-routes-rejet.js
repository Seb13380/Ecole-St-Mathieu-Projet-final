/**
 * 🔍 DIAGNOSTIC ROUTES REJET VPS
 * Vérifier pourquoi /directeur/inscriptions/:id/reject retourne 404
 */

const express = require('express');
const path = require('path');

async function diagnosticRoutesVPS() {
    console.log('🔍 DIAGNOSTIC ROUTES REJET VPS');
    console.log('='.repeat(50));

    try {
        // 1. Vérifier que les fichiers de routes existent
        const routeFiles = [
            'src/routes/directeurRoutes.js',
            'src/routes/secretaireRoutes.js',
            'src/controllers/inscriptionController.js'
        ];

        console.log('\n📁 VÉRIFICATION FICHIERS:');
        const fs = require('fs');

        routeFiles.forEach(file => {
            const exists = fs.existsSync(file);
            console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
        });

        // 2. Vérifier le contenu des routes
        console.log('\n🛣️  VÉRIFICATION ROUTES DIRECTEUR:');
        if (fs.existsSync('src/routes/directeurRoutes.js')) {
            const directeurRoutes = fs.readFileSync('src/routes/directeurRoutes.js', 'utf8');
            const hasRejectRoute = directeurRoutes.includes('/inscriptions/:id/reject');
            console.log(`   Route reject présente: ${hasRejectRoute ? '✅' : '❌'}`);

            if (hasRejectRoute) {
                const rejectLines = directeurRoutes.split('\n').filter(line =>
                    line.includes('/inscriptions/:id/reject')
                );
                console.log('   Ligne trouvée:', rejectLines[0]?.trim());
            }
        }

        // 3. Vérifier le contrôleur
        console.log('\n🎮 VÉRIFICATION CONTRÔLEUR:');
        if (fs.existsSync('src/controllers/inscriptionController.js')) {
            const controller = fs.readFileSync('src/controllers/inscriptionController.js', 'utf8');
            const hasRejectFunction = controller.includes('rejectRequest:');
            console.log(`   Fonction rejectRequest: ${hasRejectFunction ? '✅' : '❌'}`);
        }

        // 4. Instructions pour diagnostic VPS
        console.log('\n🔧 DIAGNOSTIC À FAIRE SUR VPS:');
        console.log('1. cd /var/www/project/ecole_st_mathieu');
        console.log('2. grep -n "inscriptions/:id/reject" src/routes/directeurRoutes.js');
        console.log('3. grep -n "rejectRequest" src/controllers/inscriptionController.js');
        console.log('4. pm2 logs | grep -i route');
        console.log('5. Vérifiez app.js pour voir si les routes sont bien chargées');

        // 5. Test des routes avec Express temporaire
        console.log('\n🧪 TEST SIMULATION ROUTES:');
        console.log('Routes qui devraient être disponibles:');
        console.log('   POST /directeur/inscriptions/:id/reject');
        console.log('   POST /secretaire/inscriptions/:id/reject');
        console.log('   DELETE /directeur/inscriptions/:id/delete');
        console.log('   DELETE /secretaire/inscriptions/:id/delete');

        // 6. Vérification app.js
        console.log('\n📱 VÉRIFICATION APP.JS:');
        if (fs.existsSync('app.js')) {
            const appjs = fs.readFileSync('app.js', 'utf8');
            const hasDirecteurRoutes = appjs.includes('directeurRoutes') || appjs.includes('./routes/directeur');
            console.log(`   Routes directeur chargées: ${hasDirecteurRoutes ? '✅' : '❌'}`);

            // Chercher les lignes qui chargent les routes
            const routeLines = appjs.split('\n').filter(line =>
                line.includes('routes') && (line.includes('use') || line.includes('require'))
            );

            console.log('   Lignes de chargement routes:');
            routeLines.forEach(line => {
                console.log(`     ${line.trim()}`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

// Instructions pour VPS
console.log('\n📋 COMMANDES POUR VPS:');
console.log('cd /var/www/project/ecole_st_mathieu');
console.log('node diagnostic-routes-rejet.js');
console.log('');
console.log('Si la route est manquante, vérifiez:');
console.log('1. git status (fichiers non synchronisés ?)');
console.log('2. pm2 restart all (redémarrage complet)');
console.log('3. Comparez avec les fichiers locaux');

diagnosticRoutesVPS();