#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function addExternalLinksColumns() {
    let connection;
    try {
        console.log('ðŸ“Š === AJOUT COLONNES EXTERNAL LINKS ===');
        console.log('====\n');

        // Connexion Ã  MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'ecole_st_mathieu'
        });

        console.log('âœ… Connexion Ã  la base de donnÃ©es rÃ©ussie');

        // VÃ©rifier si les colonnes existent dÃ©jÃ 
        console.log('\nðŸ” VÃ©rification des colonnes existantes...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ecole_st_mathieu' 
            AND TABLE_NAME = 'Document'
            AND COLUMN_NAME IN ('externalUrl', 'isExternalLink')
        `);

        const existingColumns = columns.map(row => row.COLUMN_NAME);
        console.log('Colonnes existantes:', existingColumns);

        // Ajouter externalUrl si elle n'existe pas
        if (!existingColumns.includes('externalUrl')) {
            console.log('\nâž• Ajout de la colonne externalUrl...');
            await connection.execute(`
                ALTER TABLE Document 
                ADD COLUMN externalUrl VARCHAR(255) NULL
            `);
            console.log('âœ… Colonne externalUrl ajoutÃ©e');
        } else {
            console.log('âœ… Colonne externalUrl existe dÃ©jÃ ');
        }

        // Ajouter isExternalLink si elle n'existe pas
        if (!existingColumns.includes('isExternalLink')) {
            console.log('\nâž• Ajout de la colonne isExternalLink...');
            await connection.execute(`
                ALTER TABLE Document 
                ADD COLUMN isExternalLink BOOLEAN NOT NULL DEFAULT FALSE
            `);
            console.log('âœ… Colonne isExternalLink ajoutÃ©e');
        } else {
            console.log('âœ… Colonne isExternalLink existe dÃ©jÃ ');
        }

        // VÃ©rifier le rÃ©sultat
        console.log('\nðŸ” VÃ©rification finale...');
        const [finalColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ecole_st_mathieu' 
            AND TABLE_NAME = 'Document'
            ORDER BY ORDINAL_POSITION
        `);

        console.log('\nðŸ“‹ Structure finale de la table Document:');
        finalColumns.forEach(col => {
            console.log(`   ${col.COLUMN_NAME} (${col.DATA_TYPE}) - NULL: ${col.IS_NULLABLE} - DEFAULT: ${col.COLUMN_DEFAULT}`);
        });

        console.log('\nðŸŽ‰ Migration terminÃ©e avec succÃ¨s !');

    } catch (error) {
        console.error('âŒ Erreur lors de la migration:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nðŸ”Œ Connexion fermÃ©e');
        }
    }
}

addExternalLinksColumns();

