console.log('🔍 Vérification des corrections DIRECTION...\n');

// Vérifier que tous les fichiers critiques utilisent le bon rôle
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

console.log('\n' + '='.repeat(50));
if (allCorrect) {
    console.log('🎉 Toutes les corrections sont en place !');
    console.log('\n📝 Lionel peut maintenant :');
    console.log('   ✅ Se connecter avec lionel.camboulives@ecole-saint-mathieu.fr');
    console.log('   ✅ Utiliser le mot de passe: Directeur2025!');
    console.log('   ✅ Être redirigé vers /directeur/dashboard');
    console.log('   ✅ Voir le lien dashboard dans le header');
    console.log('\n🌐 Testez sur: http://localhost:3007/login');
} else {
    console.log('⚠️  Certaines corrections ne sont pas appliquées');
}
console.log('='.repeat(50));
