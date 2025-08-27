console.log('=== VÉRIFICATION CONFIGURATION VPS ===\n');

// Variables d'environnement importantes
const envVars = {
    'NODE_ENV': process.env.NODE_ENV || 'Non défini',
    'PORT': process.env.PORT || 'Non défini',
    'DATABASE_URL': process.env.DATABASE_URL ? 'Défini (masqué)' : 'Non défini',
    'SESSION_SECRET': process.env.SESSION_SECRET ? 'Défini (masqué)' : 'Non défini',
    'BASE_URL': process.env.BASE_URL || 'Non défini'
};

console.log('🔧 VARIABLES D\'ENVIRONNEMENT:');
Object.entries(envVars).forEach(([key, value]) => {
    const status = value.includes('Non défini') ? '❌' : '✅';
    console.log(`  ${status} ${key}: ${value}`);
});

console.log('\n📊 INFORMATIONS SYSTÈME:');
console.log(`  Node.js version: ${process.version}`);
console.log(`  Plateforme: ${process.platform}`);
console.log(`  Architecture: ${process.arch}`);

console.log('\n🔍 VÉRIFICATIONS IMPORTANTES:');

// Vérification Prisma Client
try {
    const { PrismaClient } = require('@prisma/client');
    console.log('  ✅ Prisma Client chargé');

    const prisma = new PrismaClient();
    console.log('  ✅ Instance Prisma créée');
} catch (error) {
    console.log('  ❌ Problème Prisma:', error.message);
}

// Vérification bcrypt
try {
    const bcrypt = require('bcrypt');
    console.log('  ✅ bcrypt chargé');
} catch (error) {
    console.log('  ❌ Problème bcrypt:', error.message);
}

// Vérification express-session
try {
    const session = require('express-session');
    console.log('  ✅ express-session chargé');
} catch (error) {
    console.log('  ❌ Problème express-session:', error.message);
}

console.log('\n=== RECOMMANDATIONS VPS ===');
console.log('1. 📁 Vérifiez que tous les fichiers sont bien uploadés');
console.log('2. 🗄️ Vérifiez la connexion à la base de données');
console.log('3. 🔑 Vérifiez que le SESSION_SECRET est défini');
console.log('4. 🌐 Vérifiez que le domaine est correctement configuré');
console.log('5. 🔄 Redémarrez le service Node.js sur le VPS');

console.log('\n📋 COMMANDES UTILES SUR LE VPS:');
console.log('  • pm2 restart all (si vous utilisez PM2)');
console.log('  • npm run migrate (pour migrer la DB)');
console.log('  • npm install (pour les dépendances)');
console.log('  • node test-login-vps.js (pour tester les connexions)');

console.log('\n🔐 IDENTIFIANTS PRÊTS:');
console.log('  Lionel: l.camboulives@stmathieu.org / lionel123');
console.log('  Frank: frank@stmathieu.org / frank123');
