// Script pour ajouter le rôle GESTIONNAIRE_SITE directement dans la base de données
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addGestionnaireRole() {
    let connection;

    try {
        console.log('🔧 Connexion à la base de données...');

        // Parse de l'URL de base de données
        const dbUrl = process.env.DATABASE_URL;
        console.log('🔗 URL de BDD:', dbUrl);

        const urlParts = dbUrl.match(/mysql:\/\/([^:]*):([^@]*)@([^:]+):(\d+)\/(.+)/);

        if (!urlParts) {
            throw new Error('Format d\'URL de base de données invalide: ' + dbUrl);
        }

        const [, user, password, host, port, database] = urlParts;

        console.log('📊 Paramètres de connexion:', { user, host, port, database });

        connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user,
            password,
            database
        });

        console.log('✅ Connecté à la base de données');

        // Vérifier si GESTIONNAIRE_SITE existe déjà dans l'enum
        console.log('🔍 Vérification de l\'enum UserRole...');

        const [enumRows] = await connection.execute(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'User' 
            AND COLUMN_NAME = 'role'
        `, [database]);

        if (enumRows.length > 0) {
            const columnType = enumRows[0].COLUMN_TYPE;
            console.log('📋 Enum actuel:', columnType);

            if (!columnType.includes('GESTIONNAIRE_SITE')) {
                console.log('➕ Ajout de GESTIONNAIRE_SITE à l\'enum...');

                // Modifier l'enum pour ajouter GESTIONNAIRE_SITE
                const newEnumValues = columnType
                    .replace(/enum\((.*)\)/, '$1')
                    .replace(/'/g, '')
                    .split(',')
                    .map(v => v.trim())
                    .filter(v => v !== 'MAINTENANCE_SITE'); // Supprimer MAINTENANCE_SITE

                // Ajouter GESTIONNAIRE_SITE
                newEnumValues.push('GESTIONNAIRE_SITE');

                const newEnumString = newEnumValues.map(v => `'${v}'`).join(',');

                await connection.execute(`
                    ALTER TABLE User 
                    MODIFY COLUMN role ENUM(${newEnumString})
                `);

                console.log('✅ Enum mis à jour avec GESTIONNAIRE_SITE');
            } else {
                console.log('✅ GESTIONNAIRE_SITE déjà présent dans l\'enum');
            }
        }

        // Mettre à jour Frank pour avoir le rôle GESTIONNAIRE_SITE
        console.log('🔄 Mise à jour du rôle de Frank...');

        const [updateResult] = await connection.execute(`
            UPDATE User 
            SET role = 'GESTIONNAIRE_SITE' 
            WHERE email = 'frank@stmathieu.org'
        `);

        if (updateResult.affectedRows > 0) {
            console.log('✅ Rôle de Frank mis à jour vers GESTIONNAIRE_SITE');
        } else {
            console.log('⚠️ Frank non trouvé pour la mise à jour');
        }

        // Mettre à jour tous les autres MAINTENANCE_SITE vers GESTIONNAIRE_SITE
        console.log('🔄 Migration des autres utilisateurs MAINTENANCE_SITE...');

        const [migrateResult] = await connection.execute(`
            UPDATE User 
            SET role = 'GESTIONNAIRE_SITE' 
            WHERE role = 'MAINTENANCE_SITE'
        `);

        if (migrateResult.affectedRows > 0) {
            console.log(`✅ ${migrateResult.affectedRows} utilisateur(s) migré(s) vers GESTIONNAIRE_SITE`);
        }

        // Afficher le résumé
        console.log('\n📋 Résumé des utilisateurs administratifs:');

        const [adminUsers] = await connection.execute(`
            SELECT firstName, lastName, email, role 
            FROM User 
            WHERE role IN ('ADMIN', 'DIRECTION', 'GESTIONNAIRE_SITE')
            ORDER BY role, lastName
        `);

        adminUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connexion fermée');
        }
    }
}

// Exécuter le script
addGestionnaireRole()
    .then(() => {
        console.log('\n✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
