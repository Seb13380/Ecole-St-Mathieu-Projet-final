const fs = require('fs');
const path = require('path');

console.log('🧹 NETTOYAGE DU PROJET\n');
console.log('='.repeat(70));

// Liste des patterns de fichiers à supprimer
const patternsToDelete = [
    // Scripts de test
    /^test-.+\.js$/,
    /^test-.+\.html$/,
    /^test-.+\.ps1$/,
    /^test-.+\.bat$/,
    /^test-.+\.sh$/,
    /^test-.+\.log$/,
    /^test-.+\.txt$/,
    /^test-.+\.xlsx$/,
    
    // Scripts de vérification
    /^verify-.+\.js$/,
    /^verifier-.+\.js$/,
    /^verification-.+\.js$/,
    
    // Scripts de check
    /^check-.+\.js$/,
    /^check-.+\.sql$/,
    
    // Scripts de diagnostic
    /^diagnos.+\.js$/,
    /^diagnostic-.+\.js$/,
    /^diagnostic-.+\.ps1$/,
    /^diagnostic-.+\.sh$/,
    
    // Scripts de debug
    /^debug-.+\.js$/,
    
    // Scripts de fix temporaires
    /^fix-.+\.js$/,
    /^fix-.+\.sql$/,
    /^fix-.+\.ps1$/,
    /^fix-.+\.sh$/,
    
    // Scripts de correction temporaires
    /^correction-.+\.js$/,
    /^corriger-.+\.js$/,
    
    // Scripts d'analyse
    /^analyz.+\.js$/,
    /^analyser-.+\.js$/,
    
    // Scripts de création de test
    /^create-test-.+\.js$/,
    /^create-sample-.+\.js$/,
    /^create-admin-.+\.js$/,
    /^create-parent-.+\.js$/,
    /^create-essential-.+\.js$/,
    /^create-temp-.+\.js$/,
    /^create-all-main-.+\.js$/,
    
    // Scripts de déploiement temporaires
    /^deploy-.+\.ps1$/,
    /^deploy-.+\.sh$/,
    /^deploy-.+\.bat$/,
    
    // Scripts de monitoring
    /^monitor-.+\.js$/,
    
    // Scripts VPS temporaires
    /^vps-.+\.js$/,
    /^vps-.+\.sh$/,
    
    // Scripts de migration temporaires
    /^migrate-.+\.js$/,
    /^migration-.+\.sql$/,
    
    // Scripts de nettoyage anciens
    /^clean-.+\.js$/,
    /^clean-.+\.ps1$/,
    
    // Scripts de sync
    /^sync-.+\.js$/,
    /^sync-.+\.ps1$/,
    /^sync-.+\.sh$/,
    
    // Scripts de réparation
    /^repair-.+\.js$/,
    /^reparation-.+\.js$/,
    /^reparation-.+\.sh$/,
    /^rollback-.+\.ps1$/,
    
    // Scripts divers temporaires
    /^recap-.+\.js$/,
    /^resume-.+\.js$/,
    /^inspect-.+\.js$/,
    /^list-.+\.js$/,
    /^find-.+\.js$/,
    /^get-.+\.js$/,
    /^setup-.+\.js$/,
    /^seed-.+\.js$/,
    /^generate-.+\.js$/,
    /^insert-.+\.js$/,
    /^update-.+\.js$/,
    /^export-.+\.js$/,
    /^restore-.+\.js$/,
    /^recover-.+\.js$/,
    /^recreate-.+\.js$/,
    /^reset-.+\.js$/,
    /^delete-.+\.js$/,
    /^add-.+\.js$/,
    /^activate-.+\.js$/,
    /^activer-.+\.js$/,
    /^convert-.+\.js$/,
    /^associer-.+\.js$/,
    /^final-.+\.js$/,
    /^finalize-.+\.js$/,
    
    // Fichiers de backup/template temporaires
    /^dashboard-backup-.+\.twig$/,
    /^dashboard-clean\.twig$/,
    /^menus-clean\.twig$/,
    
    // Fichiers JSON temporaires
    /^documents-backup\.json$/,
    /^preinscription_requests\.json$/,
    /^inscriptions-local\.json$/,
    
    // Fichiers SQL temporaires
    /^create-users.+\.sql$/,
    /^restore-documents.+\.sql$/,
    
    // Scripts de plan/guide temporaires
    /^plan-.+\.js$/,
    /^guide-.+\.txt$/,
    /^instructions-.+\.js$/,
    
    // Scripts spécifiques temporaires
    /^change-password\.js$/,
    /^clear-cache\.js$/,
    /^backup-before-reset\.js$/,
    /^interactive-password\.js$/,
    /^server-backup\.js$/,
    /^validate-dashboard\.js$/,
    /^search-contacts\.js$/,
    
    // Fichiers HTML de test
    /^admin-create-users\.html$/,
    /^index\.html$/,
    /^tailwind-classes\.html$/,
    
    // Fichiers texte temporaires
    /^query$/,
    /^google-maps-urls\.txt$/,
];

// Fichiers spécifiques à supprimer
const specificFilesToDelete = [
    'cleanup-project.js', // Ce script lui-même après exécution
];

const rootDir = __dirname;
let deletedCount = 0;
let keptCount = 0;
const deletedFiles = [];
const errors = [];

// Lire tous les fichiers du répertoire racine
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    const filePath = path.join(rootDir, file);
    
    // Ignorer les dossiers
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        return;
    }
    
    // Vérifier si le fichier correspond à un pattern
    let shouldDelete = false;
    
    for (const pattern of patternsToDelete) {
        if (pattern.test(file)) {
            shouldDelete = true;
            break;
        }
    }
    
    if (shouldDelete) {
        try {
            fs.unlinkSync(filePath);
            deletedFiles.push(file);
            deletedCount++;
        } catch (error) {
            errors.push(`Erreur suppression ${file}: ${error.message}`);
        }
    } else {
        keptCount++;
    }
});

console.log('\n📊 RÉSULTATS DU NETTOYAGE:\n');
console.log(`✅ Fichiers supprimés: ${deletedCount}`);
console.log(`📁 Fichiers conservés: ${keptCount}`);

if (deletedFiles.length > 0) {
    console.log('\n🗑️  FICHIERS SUPPRIMÉS:\n');
    deletedFiles.sort().forEach(file => {
        console.log(`   ❌ ${file}`);
    });
}

if (errors.length > 0) {
    console.log('\n⚠️  ERREURS:\n');
    errors.forEach(error => {
        console.log(`   ${error}`);
    });
}

console.log('\n' + '='.repeat(70));
console.log('✅ Nettoyage terminé!\n');
console.log('📝 Fichiers importants conservés:');
console.log('   - app.js (serveur principal)');
console.log('   - package.json');
console.log('   - .env');
console.log('   - prisma/ (schéma base de données)');
console.log('   - src/ (code source de l\'application)');
console.log('   - public/ (fichiers statiques)');
console.log('   - README.md');
console.log('='.repeat(70));
