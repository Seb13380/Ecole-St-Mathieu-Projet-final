const fs = require('fs');
const path = require('path');

console.log('🧹 NETTOYAGE DES CONSOLE.LOG\n');
console.log('='.repeat(70));

const controllersDir = path.join(__dirname, 'src', 'controllers');

// Patterns de console.log à supprimer (mais garder console.error)
const patterns = [
    // Logs de debug basiques
    /\s*console\.log\([^)]*\);\s*\n/g,
    /\s*\/\/\s*console\.log\([^)]*\);\s*\n/g,

    // Logs multi-lignes
    /\s*console\.log\([^)]*\);?\s*\n/g,
];

let totalRemoved = 0;
let filesProcessed = 0;

function cleanFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;
        const originalLines = content.split('\n').length;

        let removedInFile = 0;

        // Supprimer les console.log
        const consoleLogMatches = content.match(/console\.log/g);
        if (consoleLogMatches) {
            removedInFile = consoleLogMatches.length;
        }

        // Supprimer ligne par ligne les console.log
        const lines = content.split('\n');
        const cleanedLines = lines.filter(line => {
            const trimmed = line.trim();
            // Garder la ligne si elle ne contient pas console.log
            // Ou si c'est un console.error/warn/info important
            if (trimmed.includes('console.log')) {
                return false;
            }
            if (trimmed.startsWith('// console.log')) {
                return false;
            }
            return true;
        });

        content = cleanedLines.join('\n');

        const newLength = content.length;
        const newLines = content.split('\n').length;

        if (originalLength !== newLength) {
            fs.writeFileSync(filePath, content, 'utf8');
            const fileName = path.basename(filePath);
            console.log(`✅ ${fileName}`);
            console.log(`   Lignes supprimées: ${originalLines - newLines}`);
            console.log(`   Caractères économisés: ${originalLength - newLength}`);
            totalRemoved += removedInFile;
            filesProcessed++;
        }

    } catch (error) {
        console.error(`❌ Erreur dans ${filePath}:`, error.message);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.js')) {
            cleanFile(filePath);
        }
    });
}

// Nettoyer les contrôleurs
if (fs.existsSync(controllersDir)) {
    console.log('\n📂 Nettoyage des contrôleurs...\n');
    processDirectory(controllersDir);
}

// Nettoyer les routes
const routesDir = path.join(__dirname, 'src', 'routes');
if (fs.existsSync(routesDir)) {
    console.log('\n📂 Nettoyage des routes...\n');
    processDirectory(routesDir);
}

// Nettoyer les middlewares
const middlewareDir = path.join(__dirname, 'middleware');
if (fs.existsSync(middlewareDir)) {
    console.log('\n📂 Nettoyage des middlewares...\n');
    processDirectory(middlewareDir);
}

console.log('\n' + '='.repeat(70));
console.log(`\n📊 RÉSULTATS:`);
console.log(`   Fichiers modifiés: ${filesProcessed}`);
console.log(`   console.log supprimés: ~${totalRemoved}`);
console.log('\n✅ Nettoyage terminé!');
console.log('📝 Les console.error ont été conservés pour le débogage important.');
console.log('='.repeat(70));
