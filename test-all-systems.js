#!/usr/bin/env node

/**
 * Script de test global - Exécute tous les tests du système
 */

const { testInscriptionComplete } = require('./test-inscription-complet');
const { testIdentifiantsRequest } = require('./test-identifiants');
const { testTravauxSystem } = require('./test-travaux-system');
const { testTicketSystem } = require('./test-tickets-system');

async function runAllTests() {
    console.log('🚀 TESTS GLOBAUX ÉCOLE ST MATHIEU');
    console.log('==================================');
    console.log('Exécution de tous les tests du système...\n');

    const startTime = Date.now();
    let testsReussis = 0;
    let testsEchoues = 0;

    // Test 1: Système d'inscription
    try {
        console.log('🏫 DÉBUT TEST INSCRIPTION');
        console.log('-------------------------');
        await testInscriptionComplete();
        testsReussis++;
        console.log('✅ Test inscription: RÉUSSI\n');
    } catch (error) {
        testsEchoues++;
        console.error('❌ Test inscription: ÉCHEC');
        console.error('Erreur:', error.message, '\n');
    }

    // Test 2: Demande d'identifiants
    try {
        console.log('🔑 DÉBUT TEST IDENTIFIANTS');
        console.log('--------------------------');
        await testIdentifiantsRequest();
        testsReussis++;
        console.log('✅ Test identifiants: RÉUSSI\n');
    } catch (error) {
        testsEchoues++;
        console.error('❌ Test identifiants: ÉCHEC');
        console.error('Erreur:', error.message, '\n');
    }

    // Test 3: Système de travaux
    try {
        console.log('📚 DÉBUT TEST TRAVAUX');
        console.log('---------------------');
        await testTravauxSystem();
        testsReussis++;
        console.log('✅ Test travaux: RÉUSSI\n');
    } catch (error) {
        testsEchoues++;
        console.error('❌ Test travaux: ÉCHEC');
        console.error('Erreur:', error.message, '\n');
    }

    // Test 4: Système de tickets
    try {
        console.log('🎫 DÉBUT TEST TICKETS');
        console.log('---------------------');
        await testTicketSystem();
        testsReussis++;
        console.log('✅ Test tickets: RÉUSSI\n');
    } catch (error) {
        testsEchoues++;
        console.error('❌ Test tickets: ÉCHEC');
        console.error('Erreur:', error.message, '\n');
    }

    // Résumé final
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('===================');
    console.log(`⏱️  Durée totale: ${duration} secondes`);
    console.log(`✅ Tests réussis: ${testsReussis}`);
    console.log(`❌ Tests échoués: ${testsEchoues}`);
    console.log(`📈 Taux de réussite: ${((testsReussis / (testsReussis + testsEchoues)) * 100).toFixed(1)}%`);

    if (testsEchoues === 0) {
        console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS !');
        console.log('Le système est opérationnel.');
    } else {
        console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
        console.log('Vérifiez les erreurs ci-dessus.');
    }

    return { testsReussis, testsEchoues, duration };
}

// Exécuter tous les tests
if (require.main === module) {
    runAllTests()
        .then(result => {
            if (result.testsEchoues > 0) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 ERREUR CRITIQUE:', error);
            process.exit(1);
        });
}

module.exports = { runAllTests };
