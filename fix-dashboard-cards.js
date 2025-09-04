// Script pour uniformiser les tailles des cartes du dashboard directeur
const fs = require('fs');

function fixDashboardCards() {
    console.log('🔧 === CORRECTION DES TAILLES DE CARTES - DASHBOARD DIRECTEUR ===\n');

    const filePath = 'src/views/pages/directeur/dashboard.twig';

    if (!fs.existsSync(filePath)) {
        console.log('❌ Fichier non trouvé:', filePath);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Patterns à corriger
    const patterns = [
        {
            name: 'Classes CSS fixes (w-64 h-48)',
            pattern: /p-6 hover:shadow-xl hover:border-[^"]*" transition-all duration-300 text-center w-64 h-48"/g,
            replacement: 'p-4 sm:p-6 hover:shadow-xl hover:border-$1" transition-all duration-300 text-center min-h-[180px] sm:min-h-[200px]"'
        },
        {
            name: 'Padding des icônes',
            pattern: /bg-[^"]*-100 p-3 group-hover:bg-[^"]*-200 transition-colors mb-4/g,
            replacement: (match) => match.replace('p-3', 'p-2 sm:p-3').replace('mb-4', 'mb-3 sm:mb-4 rounded-lg')
        },
        {
            name: 'Taille des icônes SVG',
            pattern: /h-8 w-8 text-/g,
            replacement: 'h-6 w-6 sm:h-8 sm:w-8 text-'
        },
        {
            name: 'Taille des titres',
            pattern: /text-lg font-bold text-slate-800 mb-2/g,
            replacement: 'text-sm sm:text-lg font-bold text-slate-800 mb-2'
        },
        {
            name: 'Taille des descriptions',
            pattern: /text-slate-600 text-sm/g,
            replacement: 'text-slate-600 text-xs sm:text-sm'
        }
    ];

    let totalReplacements = 0;

    patterns.forEach(({ name, pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`🔍 ${name}: ${matches.length} occurrence(s) trouvée(s)`);

            if (typeof replacement === 'function') {
                content = content.replace(pattern, replacement);
            } else {
                content = content.replace(pattern, replacement);
            }
            totalReplacements += matches.length;
        }
    });

    // Correction spécifique pour les cartes avec dimensions fixes
    const fixedSizePattern = /class="[^"]*group bg-white shadow-md border-l-4 border-[^"]*" p-6 hover:shadow-xl hover:border-[^"]*" transition-all duration-300 text-center w-64 h-48"/g;
    const fixedSizeMatches = content.match(fixedSizePattern);

    if (fixedSizeMatches) {
        console.log(`🔍 Cartes avec tailles fixes: ${fixedSizeMatches.length} occurrence(s)`);

        content = content.replace(fixedSizePattern, (match) => {
            return match
                .replace('p-6', 'p-4 sm:p-6')
                .replace('w-64 h-48', 'min-h-[180px] sm:min-h-[200px]');
        });

        totalReplacements += fixedSizeMatches.length;
    }

    if (totalReplacements > 0) {
        // Sauvegarder une copie de backup
        const backupPath = filePath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
        console.log(`📄 Backup créé: ${backupPath}`);

        // Appliquer les corrections
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${totalReplacements} correction(s) appliquée(s)`);
    } else {
        console.log('✅ Aucune correction nécessaire');
    }

    console.log('\n📋 CORRECTIONS APPLIQUÉES:');
    console.log('1. Toutes les cartes utilisent maintenant: min-h-[180px] sm:min-h-[200px]');
    console.log('2. Padding responsive: p-4 sm:p-6');
    console.log('3. Icônes responsive: h-6 w-6 sm:h-8 sm:w-8');
    console.log('4. Titres responsive: text-sm sm:text-lg');
    console.log('5. Descriptions responsive: text-xs sm:text-sm');
    console.log('6. Marges des icônes: mb-3 sm:mb-4 avec rounded-lg');

    console.log('\n🧪 TESTS RECOMMANDÉS:');
    console.log('1. Aller sur le dashboard directeur');
    console.log('2. Vérifier que toutes les cartes ont la même hauteur');
    console.log('3. Tester la responsivité (mobile, tablette, desktop)');
    console.log('4. Vérifier l\'alignement des éléments');
}

fixDashboardCards();
