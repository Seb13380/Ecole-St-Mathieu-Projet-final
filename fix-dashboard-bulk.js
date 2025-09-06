const fs = require('fs');

const filePath = 'src/views/pages/directeur/dashboard.twig';

try {
    // Lire le fichier
    let content = fs.readFileSync(filePath, 'utf8');

    // Remplacement en masse : w-64 h-48 → responsive classes
    content = content.replace(/w-64 h-48/g, 'min-h-[180px] sm:min-h-[200px]');

    // Normaliser padding: p-6 → responsive padding
    content = content.replace(/(?<![a-z]-)p-6(?![a-z])/g, 'p-4 sm:p-6');

    // Normaliser icônes: h-8 w-8 → responsive icons
    content = content.replace(/h-8 w-8/g, 'h-6 w-6 sm:h-8 sm:w-8');

    // Écrire le fichier modifié
    fs.writeFileSync(filePath, content);

    console.log('✅ Dashboard cards fixes appliquées avec succès!');
    console.log('   - w-64 h-48 → min-h-[180px] sm:min-h-[200px]');
    console.log('   - Padding normalisé');
    console.log('   - Icônes responsive');

} catch (error) {
    console.error('❌ Erreur:', error.message);
}
