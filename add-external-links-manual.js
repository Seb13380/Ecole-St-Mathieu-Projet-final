#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function addExternalLinksColumns() {
    let connection;
    try {
        console.log('📊 === AJOUT COLONNES EXTERNAL LINKS ===');
        console.log('=======================================\n');

        // Connexion à MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'ecole_st_mathieu'
        });

        console.log('✅ Connexion à la base de données réussie');

        // Vérifier si les colonnes existent déjà
        console.log('\n🔍 Vérification des colonnes existantes...');
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
            console.log('\n➕ Ajout de la colonne externalUrl...');
            await connection.execute(`
                ALTER TABLE Document 
                ADD COLUMN externalUrl VARCHAR(255) NULL
            `);
            console.log('✅ Colonne externalUrl ajoutée');
        } else {
            console.log('✅ Colonne externalUrl existe déjà');
        }

        // Ajouter isExternalLink si elle n'existe pas
        if (!existingColumns.includes('isExternalLink')) {
            console.log('\n➕ Ajout de la colonne isExternalLink...');
            await connection.execute(`
                ALTER TABLE Document 
                ADD COLUMN isExternalLink BOOLEAN NOT NULL DEFAULT FALSE
            `);
            console.log('✅ Colonne isExternalLink ajoutée');
        } else {
            console.log('✅ Colonne isExternalLink existe déjà');
        }

        // Vérifier le résultat
        console.log('\n🔍 Vérification finale...');
        const [finalColumns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'ecole_st_mathieu' 
            AND TABLE_NAME = 'Document'
            ORDER BY ORDINAL_POSITION
        `);

        console.log('\n📋 Structure finale de la table Document:');
        finalColumns.forEach(col => {
            console.log(`   ${col.COLUMN_NAME} (${col.DATA_TYPE}) - NULL: ${col.IS_NULLABLE} - DEFAULT: ${col.COLUMN_DEFAULT}`);
        });

        console.log('\n🎉 Migration terminée avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion fermée');
        }
    }
}

addExternalLinksColumns();
