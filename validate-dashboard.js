const fs = require('fs');

console.log('🔍 Validation Dashboard Cards Fixes\n');

const filePath = 'src/views/pages/directeur/dashboard.twig';
const content = fs.readFileSync(filePath, 'utf8');

// Vérifications
const checkOldClasses = content.match(/w-64 h-48/g);
const checkNewClasses = content.match(/min-h-\[180px\] sm:min-h-\[200px\]/g);
const checkBadPadding = content.match(/p-4 sm:p-4 sm:p-6/g);
const checkResponsiveIcons = content.match(/h-6 w-6 sm:h-8 sm:w-8/g);

console.log('📊 Résultats de validation:');
console.log('─────────────────────────────');

if (checkOldClasses) {
    console.log(`❌ Anciennes classes trouvées: ${checkOldClasses.length} occurrences de "w-64 h-48"`);
} else {
    console.log('✅ Aucune ancienne classe "w-64 h-48" trouvée');
}

if (checkNewClasses) {
    console.log(`✅ Nouvelles classes appliquées: ${checkNewClasses.length} occurrences de "min-h-[180px] sm:min-h-[200px]"`);
} else {
    console.log('❌ Aucune nouvelle classe responsive trouvée');
}

if (checkBadPadding) {
    console.log(`❌ Padding dupliqué trouvé: ${checkBadPadding.length} occurrences de "p-4 sm:p-4 sm:p-6"`);
} else {
    console.log('✅ Aucun padding dupliqué');
}

if (checkResponsiveIcons) {
    console.log(`✅ Icônes responsive: ${checkResponsiveIcons.length} occurrences de "h-6 w-6 sm:h-8 sm:w-8"`);
}

console.log('\n🎯 Résumé:');
const allGood = !checkOldClasses && checkNewClasses && !checkBadPadding;
if (allGood) {
    console.log('✅ TOUTES LES CORRECTIONS APPLIQUÉES AVEC SUCCÈS!');
    console.log('   → Dashboard cards maintenant responsive et cohérentes');
    console.log('   → Tailles uniformes sur toutes les cartes');
    console.log('   → Prêt pour test visuel');
} else {
    console.log('⚠️  Quelques ajustements peuvent être nécessaires');
}

console.log('\n📱 Test recommandé:');
console.log('   1. Se connecter en tant que directeur');
console.log('   2. Vérifier le dashboard sur mobile/tablette/desktop');
console.log('   3. Confirmer que toutes les cartes ont la même hauteur');
