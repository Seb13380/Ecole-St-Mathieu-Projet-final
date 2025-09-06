// Script pour corriger les problèmes de création d'étudiants
const fs = require('fs');
const path = require('path');

function checkAndFixStudentCreation() {
    console.log('🔧 === Correction des problèmes de création d\'étudiants ===\n');

    const filePath = 'src/controllers/inscriptionController.js';

    if (!fs.existsSync(filePath)) {
        console.log('❌ Fichier non trouvé:', filePath);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modifications = 0;

    // Rechercher les patterns problématiques
    const problematicPatterns = [
        {
            name: 'birthDate au lieu de dateNaissance',
            pattern: /birthDate:\s*new Date\([^)]+\)/g,
            replacement: (match) => match.replace('birthDate:', 'dateNaissance:')
        }
    ];

    problematicPatterns.forEach(({ name, pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`🔍 Trouvé ${matches.length} occurrence(s) de: ${name}`);
            content = content.replace(pattern, replacement);
            modifications += matches.length;
        }
    });

    if (modifications > 0) {
        // Sauvegarder une copie de backup
        const backupPath = filePath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
        console.log(`📄 Backup créé: ${backupPath}`);

        // Appliquer les corrections
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${modifications} correction(s) appliquée(s)`);
    } else {
        console.log('✅ Aucune correction nécessaire');
    }

    console.log('\n📋 Vérifications importantes:');
    console.log('1. Le champ dateNaissance est utilisé (pas birthDate)');
    console.log('2. Le classeId est fourni lors de la création');
    console.log('3. Tous les champs requis sont présents');

    console.log('\n🧪 Test recommandé:');
    console.log('1. Connecte-toi avec: l.camboulives@stmathieu.org / Lionel123!');
    console.log('2. Va dans la section "Demandes d\'inscription"');
    console.log('3. Essaye d\'approuver une demande');
}

checkAndFixStudentCreation();
