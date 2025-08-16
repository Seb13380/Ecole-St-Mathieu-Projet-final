const mysql = require('mysql2/promise');

async function createCarouselTable() {
    console.log('🎠 Création de la table CarouselImage directement en MySQL...\n');

    try {
        // Connexion à MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Ajustez si vous avez un mot de passe
            database: 'ecole_st_mathieux'
        });

        console.log('✅ Connexion à MySQL établie');

        // Créer la table CarouselImage
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS CarouselImage (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                originalUrl VARCHAR(500) NOT NULL,
                titre VARCHAR(255),
                description TEXT,
                ordre INT DEFAULT 0,
                active BOOLEAN DEFAULT TRUE,
                auteurId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (active),
                INDEX idx_ordre (ordre),
                FOREIGN KEY (auteurId) REFERENCES User(id) ON DELETE CASCADE
            );
        `;

        await connection.execute(createTableSQL);
        console.log('✅ Table CarouselImage créée avec succès');

        // Vérifier que la table existe
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'CarouselImage'"
        );

        if (tables.length > 0) {
            console.log('✅ Table CarouselImage confirmée dans la base');

            // Afficher la structure
            const [columns] = await connection.execute(
                "DESCRIBE CarouselImage"
            );

            console.log('\n📋 Structure de la table:');
            columns.forEach(col => {
                console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
            });
        }

        await connection.end();
        console.log('\n🎉 Configuration terminée!');
        console.log('\nMaintenant vous pouvez:');
        console.log('1. Accéder à http://localhost:3000/carousel/manage');
        console.log('2. Utiliser les dashboards de Lionel et Frank');
        console.log('3. Ajouter des images au carrousel');

    } catch (error) {
        console.error('❌ Erreur:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Problème d\'accès MySQL. Vérifiez vos paramètres de connexion.');
        }
    }
}

createCarouselTable();
