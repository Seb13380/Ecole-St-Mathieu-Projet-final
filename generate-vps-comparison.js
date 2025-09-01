const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function generateVPSComparison() {
    try {
        console.log('🔍 GÉNÉRATION DES SCRIPTS DE COMPARAISON VPS\n');

        // 1. Créer le script de vérification pour le VPS
        const vpsCheckScript = `const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyVPS() {
    try {
        console.log('🔍 VÉRIFICATION VPS - École Saint-Mathieu\\n');
        
        console.log('📄 1. DOCUMENTS:');
        const documents = await prisma.document.findMany({
            orderBy: { type: 'asc' }
        });
        
        console.log('   - Total documents:', documents.length);
        console.log('   - Documents actifs:', documents.filter(d => d.active).length);
        console.log('');
        
        if (documents.length === 0) {
            console.log('   ❌ PROBLÈME: Aucun document trouvé !');
            console.log('   🔧 SOLUTION: Exécuter le script restore-documents-vps.sql');
        } else {
            console.log('   📋 Liste des documents:');
            documents.forEach(doc => {
                const status = doc.active ? '✅' : '❌';
                console.log('      ' + status + ' ' + doc.type + ': "' + doc.titre + '"');
                if (doc.pdfUrl) console.log('         📎 PDF: ' + doc.pdfUrl);
            });
        }
        
        console.log('\\n🌐 2. TEST DE ROUTE:');
        console.log('   Testez maintenant: https://votre-domaine.com/documents/ecole');
        
        console.log('\\n📁 3. FICHIERS PDF À VÉRIFIER:');
        const documentsWithPDF = documents.filter(d => d.pdfUrl);
        documentsWithPDF.forEach(doc => {
            console.log('   - ' + doc.pdfUrl);
        });
        
        console.log('\\n✅ Vérifiez que ces fichiers existent sur le serveur !');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyVPS();`;

        fs.writeFileSync('verify-vps.js', vpsCheckScript);
        console.log('✅ Script de vérification VPS créé: verify-vps.js');

        // 2. Créer un guide de synchronisation
        const guide = `🔍 GUIDE DE SYNCHRONISATION LOCAL → VPS
=========================================

VOTRE SITUATION:
- ✅ LOCAL: 10 documents affichés correctement sur /documents/ecole
- ❌ VPS: Page différente (documents manquants)
- 🚨 URGENT: Déploiement officiel demain

ÉTAPES DE SYNCHRONISATION:

1. � TRANSFÉRER LES FICHIERS:
   ─────────────────────────────
   Sur votre serveur VPS, transférez:
   - restore-documents-vps.sql (base de données)
   - verify-vps.js (vérification)
   - Le dossier /uploads/documents/ (fichiers PDF)

2. 🗄️ RESTAURER LA BASE DE DONNÉES:
   ─────────────────────────────────
   mysql -u username -p database_name < restore-documents-vps.sql

3. 🔄 REDÉMARRER LE SERVEUR:
   ──────────────────────────
   pm2 restart app
   # ou votre méthode de redémarrage

4. ✅ VÉRIFIER:
   ─────────────
   node verify-vps.js
   
5. 🌐 TESTER:
   ───────────
   https://votre-domaine.com/documents/ecole

FICHIERS PDF À TRANSFÉRER:
──────────────────────────`;

        // Obtenir la liste des documents avec PDF
        const documents = await prisma.document.findMany({
            where: { pdfUrl: { not: null } }
        });

        let guideComplete = guide;
        documents.forEach(doc => {
            guideComplete += `\n- ${doc.pdfUrl}`;
        });

        guideComplete += `

VÉRIFICATIONS FINALES:
═════════════════════
□ Les 10 documents s'affichent
□ Les boutons "Consulter" fonctionnent
□ Les liens PDF sont accessibles
□ Pas d'erreurs 404
□ Design identique au local

SI ÇA NE MARCHE PAS:
═══════════════════
1. Vérifiez les logs du serveur
2. Testez la connexion à la base de données
3. Vérifiez les permissions des fichiers (chmod 755)
4. Purgez le cache du navigateur (Ctrl+F5)`;

        fs.writeFileSync('guide-synchronisation-vps.txt', guideComplete);
        console.log('✅ Guide de synchronisation créé: guide-synchronisation-vps.txt');

        // 3. Afficher le résumé
        console.log('\n🎯 RÉSUMÉ DE LA SITUATION:');
        console.log('========================');
        console.log('✅ LOCAL: Page /documents/ecole parfaite avec 10 documents');
        console.log('❌ VPS: Page différente - documents manquants');
        console.log('� SOLUTION: Synchroniser avec restore-documents-vps.sql');
        console.log('🚨 URGENT: Déploiement demain !');

        console.log('\n📋 FICHIERS CRÉÉS POUR VOUS:');
        console.log('===========================');
        console.log('1. verify-vps.js (à exécuter sur le VPS)');
        console.log('2. guide-synchronisation-vps.txt (instructions détaillées)');
        console.log('3. restore-documents-vps.sql (déjà créé)');

        console.log('\n🚀 PROCHAINES ÉTAPES:');
        console.log('====================');
        console.log('1. Connectez-vous à votre VPS');
        console.log('2. Transférez restore-documents-vps.sql');
        console.log('3. Exécutez le script SQL sur la base');
        console.log('4. Redémarrez le serveur');
        console.log('5. Testez /documents/ecole');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

generateVPSComparison();
