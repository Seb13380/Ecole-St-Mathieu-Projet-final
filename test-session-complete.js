// Test de l'API avec simulation de session navigateur
const https = require('https');
const http = require('http');

// Fonction pour faire des requêtes HTTP/HTTPS
function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const req = protocol.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function testWithSession() {
    try {
        console.log('🔐 1. Test de connexion...');

        // 1. Connexion pour obtenir une session
        const loginData = 'email=l.camboulives@stmathieu.org&password=test123';
        const loginResponse = await makeRequest('http://localhost:3007/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, loginData);

        console.log('📊 Status connexion:', loginResponse.status);

        // Extraire le cookie de session
        const setCookieHeader = loginResponse.headers['set-cookie'];
        let sessionCookie = '';
        if (setCookieHeader) {
            sessionCookie = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
            console.log('🍪 Cookie de session:', sessionCookie);
        }

        if (loginResponse.status === 302 || loginResponse.status === 200) {
            console.log('✅ Connexion réussie!');

            // 2. Test de création d'élève avec session
            console.log('\\n👨‍🎓 2. Test de création d\'élève...');

            const studentData = {
                firstName: 'TestPrenom',
                lastName: 'TestNom',
                birthDate: '2020-09-01',
                parentId: 3,
                classeId: 1
            };

            const createResponse = await makeRequest('http://localhost:3007/user-management/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cookie': sessionCookie,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }, JSON.stringify(studentData));

            console.log('📊 Status création:', createResponse.status);
            console.log('📋 Headers réponse:', createResponse.headers);

            if (createResponse.headers['content-type'] && createResponse.headers['content-type'].includes('json')) {
                try {
                    const result = JSON.parse(createResponse.body);
                    console.log('✅ Réponse JSON:', result);
                } catch (e) {
                    console.log('❌ Erreur parsing JSON:', e.message);
                    console.log('📄 Réponse brute:', createResponse.body.substring(0, 500));
                }
            } else {
                console.log('📄 Réponse HTML (première partie):', createResponse.body.substring(0, 500));
            }
        } else {
            console.log('❌ Connexion échouée');
            console.log('📄 Réponse:', loginResponse.body.substring(0, 500));
        }

    } catch (error) {
        console.error('💥 Erreur:', error.message);
    }
}

testWithSession();
