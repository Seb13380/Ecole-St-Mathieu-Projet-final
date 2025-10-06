/**
 * 🚨 CORRECTION URGENTE DU JAVASCRIPT DE SUPPRESSION
 * Le problème: Les boutons "Supprimer" appellent "/reject" au lieu de "/delete"
 */

const fs = require('fs');
const path = require('path');

async function fixJavaScriptSuppression() {
    console.log('🔧 CORRECTION JAVASCRIPT SUPPRESSION');
    console.log('='.repeat(50));

    const fichierVue = 'src/views/pages/admin/inscription-requests.twig';

    try {
        // Lire le fichier actuel
        const contenu = fs.readFileSync(fichierVue, 'utf8');

        console.log('📄 Fichier lu:', fichierVue);

        // Chercher les problèmes potentiels
        const lignesProblematiques = [];
        const lignes = contenu.split('\n');

        lignes.forEach((ligne, index) => {
            if (ligne.includes('onclick=') && ligne.includes('reject')) {
                lignesProblematiques.push({
                    ligne: index + 1,
                    contenu: ligne.trim()
                });
            }
        });

        console.log('\n🔍 LIGNES PROBLÉMATIQUES TROUVÉES:');
        if (lignesProblematiques.length === 0) {
            console.log('✅ Aucune ligne problématique détectée dans le fichier local');
        } else {
            lignesProblematiques.forEach(probleme => {
                console.log(`   Ligne ${probleme.ligne}: ${probleme.contenu}`);
            });
        }

        // Vérifier la présence des bonnes fonctions
        const aDeleteRequest = contenu.includes('deleteRequest(');
        const aRejectRequest = contenu.includes('rejectRequest(');
        const routeDelete = contenu.includes('/delete');
        const routeReject = contenu.includes('/reject');

        console.log('\n📊 ANALYSE DU FICHIER:');
        console.log(`   Fonction deleteRequest(): ${aDeleteRequest ? '✅' : '❌'}`);
        console.log(`   Fonction rejectRequest(): ${aRejectRequest ? '✅' : '❌'}`);
        console.log(`   Route /delete: ${routeDelete ? '✅' : '❌'}`);
        console.log(`   Route /reject: ${routeReject ? '✅' : '❌'}`);

        // Instructions pour vérification manuellle
        console.log('\n🔍 VÉRIFICATION À FAIRE SUR LE VPS:');
        console.log('1. Connectez-vous au VPS');
        console.log('2. Allez dans le fichier:');
        console.log('   nano /var/www/project/ecole_st_mathieu/src/views/pages/admin/inscription-requests.twig');
        console.log('3. Cherchez les boutons "Supprimer" (Ctrl+W puis tapez "Supprimer")');
        console.log('4. Vérifiez que onclick appelle deleteRequest() et non rejectRequest()');
        console.log('5. Vérifiez que la fonction deleteRequest() utilise la route /delete');

        console.log('\n🛠️ CORRECTION AUTOMATIQUE:');
        console.log('Créons un script de correction pour le VPS...');

        // Script de correction pour le VPS
        const scriptCorrection = `#!/bin/bash
# Script de correction pour VPS

echo "🔧 CORRECTION JAVASCRIPT SUPPRESSION VPS"
echo "========================================"

cd /var/www/project/ecole_st_mathieu

# Sauvegarder l'original
cp src/views/pages/admin/inscription-requests.twig src/views/pages/admin/inscription-requests.twig.backup-$(date +%Y%m%d_%H%M%S)

echo "✅ Sauvegarde créée"

# Vérifier le contenu actuel
echo ""
echo "🔍 CONTENU ACTUEL (boutons Supprimer):"
grep -n "Supprimer" src/views/pages/admin/inscription-requests.twig | head -5

echo ""
echo "🔍 FONCTIONS JAVASCRIPT (deleteRequest/rejectRequest):"
grep -n "deleteRequest\\|rejectRequest" src/views/pages/admin/inscription-requests.twig | head -5

echo ""
echo "📋 INSTRUCTIONS:"
echo "1. Ouvrez le fichier avec: nano src/views/pages/admin/inscription-requests.twig"
echo "2. Cherchez les boutons 'Supprimer'"
echo "3. Vérifiez que onclick='deleteRequest()' et non 'rejectRequest()'"
echo "4. Redémarrez PM2: pm2 restart all"
`;

        fs.writeFileSync('fix-suppression-vps.sh', scriptCorrection);
        console.log('✅ Script créé: fix-suppression-vps.sh');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

fixJavaScriptSuppression();