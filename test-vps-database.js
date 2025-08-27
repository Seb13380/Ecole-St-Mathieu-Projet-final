const mysql = require('mysql2/promise');

async function testVPSDatabase() {
    const dbConfig = {
        host: '141.95.174.197',
        port: 3306,
        user: 'suprauser',
        password: 'manonenretard@sebastieng',
        database: 'ecole_st_mathieux'
    };

    console.log('=== TEST CONNEXION BASE DE DONNÉES VPS ===\n');
    console.log('🔗 Tentative de connexion à:', dbConfig.host);
    console.log('📊 Base de données:', dbConfig.database);
    console.log('👤 Utilisateur:', dbConfig.user);

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connexion établie !');

        // Test simple
        const [rows] = await connection.execute('SELECT COUNT(*) as userCount FROM User');
        console.log('📊 Nombre d\'utilisateurs dans la DB:', rows[0].userCount);

        // Test des utilisateurs spécifiques
        const [lionel] = await connection.execute(
            'SELECT id, email, firstName, lastName, role FROM User WHERE email = ?',
            ['l.camboulives@stmathieu.org']
        );

        const [frank] = await connection.execute(
            'SELECT id, email, firstName, lastName, role FROM User WHERE email = ?',
            ['frank@stmathieu.org']
        );

        console.log('\n🔍 VÉRIFICATION UTILISATEURS:');

        if (lionel.length > 0) {
            console.log('✅ Lionel trouvé:', lionel[0].firstName, lionel[0].lastName, '(' + lionel[0].role + ')');
        } else {
            console.log('❌ Lionel non trouvé dans la DB VPS');
        }

        if (frank.length > 0) {
            console.log('✅ Frank trouvé:', frank[0].firstName, frank[0].lastName, '(' + frank[0].role + ')');
        } else {
            console.log('❌ Frank non trouvé dans la DB VPS');
        }

        await connection.end();
        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('\n🔧 SOLUTIONS POSSIBLES:');
        console.log('1. Vérifiez que le serveur MySQL est en marche');
        console.log('2. Vérifiez les credentials de connexion');
        console.log('3. Vérifiez que le firewall autorise les connexions MySQL');
        console.log('4. Vérifiez que les utilisateurs existent dans la DB VPS');
    }
}

testVPSDatabase();
