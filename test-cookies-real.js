const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

// Configuration pour gérer les cookies comme un navigateur
const cookieJar = new tough.CookieJar();
const client = axios.create();
axiosCookieJarSupport(client);
client.defaults.jar = cookieJar;
client.defaults.withCredentials = true;

async function testWithRealCookies() {
    try {
        console.log('🍪 Test avec gestion complète des cookies...\n');

        // 1. Obtenir la page de login pour récupérer les cookies de session
        console.log('1️⃣ Récupération page login...');
        const loginPageResponse = await client.get('http://localhost:3007/auth/login');
        console.log('   ✅ Page login récupérée');
        console.log('   🍪 Cookies reçus:', cookieJar.getCookieStringSync('http://localhost:3007'));

        // 2. Extraire le token CSRF si présent
        const loginPageHtml = loginPageResponse.data;
        const csrfMatch = loginPageHtml.match(/name="_token" value="([^"]+)"/);
        const csrfToken = csrfMatch ? csrfMatch[1] : null;

        if (csrfToken) {
            console.log('   🔐 Token CSRF trouvé:', csrfToken.substring(0, 20) + '...');
        }

        // 3. Connexion avec les bons en-têtes
        console.log('\n2️⃣ Connexion...');

        const loginData = {
            email: 'lionel@stmathieu.com',
            password: 'lionel123'
        };

        if (csrfToken) {
            loginData._token = csrfToken;
        }

        const loginResponse = await client.post('http://localhost:3007/auth/login',
            new URLSearchParams(loginData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': 'http://localhost:3007/auth/login'
                },
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status < 400; // Accepter les redirections
                }
            }
        );

        console.log('   📡 Status login:', loginResponse.status);
        console.log('   🍪 Cookies après login:', cookieJar.getCookieStringSync('http://localhost:3007'));

        if (loginResponse.status === 302) {
            console.log('   🔄 Redirection vers:', loginResponse.headers.location);
        }

        // 4. Test accès dashboard
        console.log('\n3️⃣ Test dashboard...');

        try {
            const dashboardResponse = await client.get('http://localhost:3007/directeur/dashboard');
            console.log('   ✅ Dashboard accessible:', dashboardResponse.status);

            if (dashboardResponse.data.includes('Demandes Inscription')) {
                console.log('   ✅ Dashboard contient "Demandes Inscription"');
            } else {
                console.log('   ❌ Dashboard ne contient pas "Demandes Inscription"');
            }

        } catch (dashError) {
            console.log('   ❌ Erreur dashboard:', dashError.response?.status);
            if (dashError.response?.status === 302) {
                console.log('   🔄 Redirection dashboard vers:', dashError.response.headers.location);
            }
        }

        // 5. Test accès inscriptions
        console.log('\n4️⃣ Test inscriptions...');

        try {
            const inscriptionsResponse = await client.get('http://localhost:3007/directeur/inscriptions');
            console.log('   ✅ Inscriptions accessible:', inscriptionsResponse.status);
            console.log('   📄 Taille:', inscriptionsResponse.data.length);

            if (inscriptionsResponse.data.includes('Demandes d\'inscription')) {
                console.log('   ✅ Page contient "Demandes d\'inscription"');
            } else {
                console.log('   ❌ Page ne contient pas "Demandes d\'inscription"');

                // Vérifier si c'est encore une page de login
                if (inscriptionsResponse.data.includes('Connexion') && inscriptionsResponse.data.includes('email')) {
                    console.log('   ❌ Toujours une page de login !');
                }

                console.log('   📋 Début du contenu:', inscriptionsResponse.data.substring(0, 300));
            }

        } catch (inscError) {
            console.log('   ❌ Erreur inscriptions:', inscError.response?.status);
            if (inscError.response?.status === 302) {
                console.log('   🔄 Redirection inscriptions vers:', inscError.response.headers.location);
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

// Installer d'abord les dépendances si nécessaire
console.log('🚀 Démarrage du test avec gestion avancée des cookies...');
testWithRealCookies();
