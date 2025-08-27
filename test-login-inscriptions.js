const axios = require('axios');

// Configuration d'axios avec gestion des cookies
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3007',
    maxRedirects: 5,
    withCredentials: true,
    headers: {
        'User-Agent': 'Test-Script',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
});

async function testCompleteWorkflow() {
    try {
        console.log('🔄 Test complet du workflow directeur...\n');

        // 1. Aller à la page de login
        console.log('1️⃣ Accès à la page de login...');
        const loginPage = await axiosInstance.get('/auth/login');
        console.log('   ✅ Page login accessible (Status:', loginPage.status, ')');

        // 2. Se connecter (il faut d'abord vérifier les comptes disponibles)
        console.log('\n2️⃣ Tentative de connexion...');

        // Essayons avec le compte lionel (directeur)
        try {
            const loginResponse = await axiosInstance.post('/auth/login', {
                email: 'lionel@stmathieu.com',
                password: 'lionel123'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: [(data) => {
                    return Object.keys(data)
                        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
                        .join('&');
                }]
            });

            console.log('   ✅ Connexion réussie (Status:', loginResponse.status, ')');

            if (loginResponse.headers.location) {
                console.log('   🔄 Redirection vers:', loginResponse.headers.location);
            }

        } catch (loginError) {
            if (loginError.response && loginError.response.status === 302) {
                console.log('   ✅ Connexion réussie (redirection 302)');
                if (loginError.response.headers.location) {
                    console.log('   🔄 Redirection vers:', loginError.response.headers.location);
                }
            } else {
                console.log('   ❌ Erreur de connexion:', loginError.response?.status, loginError.response?.data || loginError.message);
                return;
            }
        }

        // 3. Tester l'accès au dashboard directeur
        console.log('\n3️⃣ Accès au dashboard directeur...');
        try {
            const dashboardResponse = await axiosInstance.get('/directeur/dashboard');
            console.log('   ✅ Dashboard accessible (Status:', dashboardResponse.status, ')');

            if (dashboardResponse.data.includes('Demandes Inscription')) {
                console.log('   ✅ Carte "Demandes Inscription" présente');
            } else {
                console.log('   ❌ Carte "Demandes Inscription" absente');
            }

        } catch (dashError) {
            console.log('   ❌ Erreur dashboard:', dashError.response?.status, dashError.message);
        }

        // 4. Tester l'accès aux inscriptions
        console.log('\n4️⃣ Accès aux demandes d\'inscription...');
        try {
            const inscriptionsResponse = await axiosInstance.get('/directeur/inscriptions');
            console.log('   ✅ Page inscriptions accessible (Status:', inscriptionsResponse.status, ')');
            console.log('   📄 Taille réponse:', inscriptionsResponse.data.length, 'caractères');

            if (inscriptionsResponse.data.includes('<!DOCTYPE html>')) {
                console.log('   ✅ HTML valide reçu');

                if (inscriptionsResponse.data.includes('Demandes d\'inscription') ||
                    inscriptionsResponse.data.includes('inscription-requests')) {
                    console.log('   ✅ Contenu des inscriptions détecté');
                } else {
                    console.log('   ❌ Contenu des inscriptions manquant');
                    console.log('   📋 Début de la réponse:', inscriptionsResponse.data.substring(0, 500));
                }
            } else {
                console.log('   ❌ Pas de HTML valide');
                console.log('   📋 Réponse:', inscriptionsResponse.data);
            }

        } catch (inscError) {
            console.log('   ❌ Erreur inscriptions:', inscError.response?.status, inscError.message);
            if (inscError.response?.data) {
                console.log('   📋 Données erreur:', inscError.response.data.substring(0, 500));
            }
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

testCompleteWorkflow();
