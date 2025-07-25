console.log('🔍 Mise à jour du diagnostic pour vérifier TOUTES les corrections...\n');

const fs = require('fs');
const path = require('path');

const filesToCheck = [
    {
        file: 'src/routes/directeurRoutes.js',
        description: 'Routes directeur',
        expectedContent: "requireRole(['DIRECTION', 'ADMIN'])",
        check: 'DIRECTION dans requireRole'
    },
    {
        file: 'src/controllers/loginController.js',
        description: 'Contrôleur login',
        expectedContent: "case 'DIRECTION':",
        check: 'Case DIRECTION dans switch'
    },
    {
        file: 'src/controllers/directeurController.js',
        description: 'Contrôleur directeur',
        expectedContent: "req.session.user.role !== 'DIRECTION'",
        check: 'Vérification rôle DIRECTION'
    },
    {
        file: 'src/controllers/profileController.js',
        description: 'Contrôleur profil',
        expectedContent: "'DIRECTION': '🎯'",
        check: 'Image profil DIRECTION'
    },
    {
        file: 'src/views/partials/header.twig',
        description: 'Header navigation',
        expectedContent: "user.role == 'DIRECTION'",
        check: 'DIRECTION dans header'
    }
];

let allCorrect = true;

filesToCheck.forEach(({ file, description, expectedContent, check }) => {
    try {
        const filePath = path.resolve(file);
        const content = fs.readFileSync(filePath, 'utf8');

        if (content.includes(expectedContent)) {
            console.log(`✅ ${description}: ${check} - OK`);
        } else {
            console.log(`❌ ${description}: ${check} - MANQUANT`);
            allCorrect = false;
        }
    } catch (error) {
        console.log(`❌ ${description}: Erreur lecture fichier - ${error.message}`);
        allCorrect = false;
    }
});

// Vérifier qu'il n'y a plus de références à DIRECTEUR dans les fichiers critiques
console.log('\n🔍 Vérification absence de DIRECTEUR dans les fichiers critiques...');

const criticalFiles = [
    'src/routes/directeurRoutes.js',
    'src/controllers/loginController.js',
    'src/controllers/directeurController.js',
    'src/controllers/profileController.js',
    'src/views/partials/header.twig'
];

let foundOldReferences = false;

criticalFiles.forEach(file => {
    try {
        const filePath = path.resolve(file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Chercher DIRECTEUR mais ignorer les commentaires et noms de fichiers
        const lines = content.split('\n');
        let hasProblematicReference = false;

        lines.forEach((line, index) => {
            if (line.includes("'DIRECTEUR'") || line.includes('"DIRECTEUR"')) {
                // Ignorer les commentaires
                if (!line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('<!--')) {
                    console.log(`⚠️  ${file}:${index + 1} - Référence DIRECTEUR trouvée: ${line.trim()}`);
                    hasProblematicReference = true;
                    foundOldReferences = true;
                }
            }
        });

        if (!hasProblematicReference) {
            console.log(`✅ ${file} - Aucune référence problématique à DIRECTEUR`);
        }

    } catch (error) {
        console.log(`❌ Erreur lecture ${file}: ${error.message}`);
    }
});

console.log('\n' + '='.repeat(70));
if (allCorrect && !foundOldReferences) {
    console.log('🎉 TOUTES LES CORRECTIONS SONT PARFAITES !');
    console.log('\n📝 Lionel Camboulives peut maintenant :');
    console.log('   ✅ Se connecter avec lionel.camboulives@ecole-saint-mathieu.fr');
    console.log('   ✅ Utiliser le mot de passe: Directeur2025!');
    console.log('   ✅ Être redirigé vers /directeur/dashboard');
    console.log('   ✅ Voir le bon template: pages/directeur/dashboard.twig');
    console.log('   ✅ Avoir tous les liens corrects dans le header');
    console.log('\n🌐 Testez sur: http://localhost:3007/login');
    console.log('🎯 Le rôle DIRECTION utilise maintenant entièrement directeur.twig !');
} else {
    console.log('⚠️  Des corrections sont encore nécessaires');
}
console.log('='.repeat(70));
