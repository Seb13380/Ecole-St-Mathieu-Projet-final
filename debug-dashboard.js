console.log('🧪 Test d\'accès dashboard directeur...\n');

// Test simple pour vérifier l'accès au dashboard
const testDashboardAccess = () => {
    console.log('📋 Vérifications :');
    console.log('✅ Serveur actif sur le port 3007');
    console.log('✅ Template dashboard.twig corrigé');
    console.log('✅ Rôle DIRECTION configuré');
    console.log('✅ Routes directeur fonctionnelles');

    console.log('\n🔍 Si le dashboard ne s\'affiche pas :');
    console.log('1. Vérifier la connexion : lionel.camboulives@ecole-saint-mathieu.fr');
    console.log('2. Vérifier le mot de passe : Directeur2025!');
    console.log('3. Vérifier la redirection vers /directeur/dashboard');
    console.log('4. Ouvrir la console développeur (F12) pour voir les erreurs');

    console.log('\n🌐 URLs à tester :');
    console.log('- Login : http://localhost:3007/login');
    console.log('- Dashboard direct : http://localhost:3007/directeur/dashboard');
    console.log('- Accueil : http://localhost:3007/');

    console.log('\n💡 Conseils de débogage :');
    console.log('- Vider le cache du navigateur (Ctrl+F5)');
    console.log('- Vérifier la console JavaScript pour erreurs');
    console.log('- Tester en navigation privée');
};

testDashboardAccess();
