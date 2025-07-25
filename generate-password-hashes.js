// Script pour générer les hashs des mots de passe pour la base de données distante
const bcrypt = require('bcrypt');

async function generatePasswordHashes() {
    console.log('🔐 Génération des hashs de mots de passe...\n');

    const passwords = {
        'Lionel (Directeur)': 'Directeur2025!',
        'Frank (Maintenance)': 'Frank2025!',
        'Yamina (Assistante)': 'Yamina2025!',
        'Sébastien (Admin)': 'Admin2025!',
        'Cécile (Restauration)': 'Cecile2025!'
    };

    for (const [user, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`${user}:`);
        console.log(`  Mot de passe: ${password}`);
        console.log(`  Hash bcrypt: ${hash}\n`);
    }

    console.log('📋 Utilisez ces hashs dans le fichier create-users.sql');
    console.log('💡 Remplacez les HASH_PLACEHOLDER par les vrais hashs ci-dessus');
}

generatePasswordHashes().catch(console.error);
