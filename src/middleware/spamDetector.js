// 🛡️ SYSTÈME ANTI-SPAM AVANCÉ POUR ÉCOLE SAINT-MATHIEU
// 
// Ce système combine plusieurs techniques pour bloquer les bots et fausses demandes :
// 1. Honeypot multiple (champs cachés)
// 2. Validation temporelle (temps de soumission)
// 3. Détection de patterns suspects
// 4. Rate limiting par IP
// 5. Validation sémantique des données

const spamDetector = {

    // 🍯 HONEYPOTS MULTIPLES
    honeypotFields: ['website', 'homepage', 'url', 'floflo', 'business', 'company'],

    // 📊 PATTERNS SUSPECTS
    suspiciousPatterns: {
        emails: [
            /@tempmail\./i,
            /@10minutemail\./i,
            /@guerrillamail\./i,
            /@mailinator\./i,
            /@yopmail\./i,
            /test@test\./i,
            /fake@fake\./i,
            /spam@spam\./i
        ],
        names: [
            /^test$/i,
            /^spam$/i,
            /^fake$/i,
            /^bot$/i,
            /^admin$/i,
            /^qwerty$/i,
            /^asdf$/i,
            /^[a-z]{20,}$/i, // Noms trop longs sans espaces
            /^[0-9]+$/, // Que des chiffres
        ],
        phones: [
            /^0{10}$/,  // 0000000000
            /^1{10}$/,  // 1111111111
            /^123456789/,
            /^000000000/,
            /^111111111/,
        ]
    },

    // ⏱️ VALIDATION TEMPORELLE
    // Trop haut peut créer des faux positifs (autofill, parents rapides)
    minFormTime: 2, // secondes minimum pour remplir le formulaire
    maxFormTime: 1800, // 30 minutes maximum

    // 🚫 RATE LIMITING
    maxRequestsPerHour: 20,
    ipMemory: new Map(),

    normalizeIp: function (ip) {
        if (!ip) return '';
        // Express peut renvoyer ::ffff:1.2.3.4
        return String(ip).replace(/^::ffff:/, '');
    },

    // 🔍 FONCTION PRINCIPALE DE DÉTECTION
    detectSpam: function (req, formStartTime) {
        const reasons = [];
        const ip = this.normalizeIp(req.ip || req.connection?.remoteAddress);
        const userAgent = req.get('User-Agent') || '';

        console.log(`🔍 Analyse anti-spam pour IP: ${ip}`);

        // 1. VÉRIFICATION HONEYPOTS
        for (const field of this.honeypotFields) {
            if (req.body[field] && req.body[field].trim() !== '') {
                reasons.push(`Honeypot "${field}" rempli: ${req.body[field]}`);
            }
        }

        // 2. VALIDATION TEMPORELLE
        if (formStartTime) {
            const formTime = (Date.now() - formStartTime) / 1000;
            if (formTime < this.minFormTime) {
                reasons.push(`Formulaire rempli trop rapidement: ${formTime}s`);
            }
            if (formTime > this.maxFormTime) {
                reasons.push(`Formulaire abandonné trop longtemps: ${formTime}s`);
            }
        }

        // 3. RATE LIMITING
        const now = Date.now();
        const hourAgo = now - (60 * 60 * 1000);

        if (!this.ipMemory.has(ip)) {
            this.ipMemory.set(ip, []);
        }

        const ipRequests = this.ipMemory.get(ip);
        // Nettoyer les anciennes requêtes
        const recentRequests = ipRequests.filter(time => time > hourAgo);

        if (recentRequests.length >= this.maxRequestsPerHour) {
            reasons.push(`Trop de requêtes: ${recentRequests.length}/h`);
        }

        // Enregistrer cette requête
        recentRequests.push(now);
        this.ipMemory.set(ip, recentRequests);

        // 4. VALIDATION EMAIL
        const email = req.body.parentEmail || req.body.email || '';
        for (const pattern of this.suspiciousPatterns.emails) {
            if (pattern.test(email)) {
                reasons.push(`Email suspect: ${email}`);
                break;
            }
        }

        // 5. VALIDATION NOMS
        const firstName = req.body.parentFirstName || req.body.firstName || '';
        const lastName = req.body.parentLastName || req.body.lastName || '';

        for (const pattern of this.suspiciousPatterns.names) {
            if (pattern.test(firstName) || pattern.test(lastName)) {
                reasons.push(`Nom suspect: ${firstName} ${lastName}`);
                break;
            }
        }

        // 6. VALIDATION TÉLÉPHONE
        const phone = req.body.parentPhone || req.body.phone || '';
        for (const pattern of this.suspiciousPatterns.phones) {
            if (pattern.test(phone.replace(/[^0-9]/g, ''))) {
                reasons.push(`Téléphone suspect: ${phone}`);
                break;
            }
        }

        // 7. USER-AGENT SUSPECT
        // Ne pas pénaliser si vide (peut arriver avec proxys / outils de sécurité).
        // On ne marque que si on détecte explicitement un UA de bot.
        if (userAgent && /bot|crawler|spider|headless|python-requests|curl|wget/i.test(userAgent)) {
            reasons.push(`User-Agent suspect: ${userAgent}`);
        }

        // 8. DÉTECTION CHAMPS IDENTIQUES
        if (firstName === lastName && firstName.length > 2) {
            reasons.push(`Prénom = Nom: ${firstName}`);
        }

        return {
            isSpam: reasons.length > 0,
            reasons: reasons,
            riskLevel: this.calculateRiskLevel(reasons),
            ip: ip,
            userAgent: userAgent
        };
    },

    // 📊 CALCUL NIVEAU DE RISQUE
    calculateRiskLevel: function (reasons) {
        if (reasons.length === 0) return 'LOW';
        if (reasons.length >= 3) return 'HIGH';

        // Certains patterns sont plus graves
        const highRiskPatterns = ['Honeypot', 'Trop de requêtes', 'rapidement'];
        const hasHighRisk = reasons.some(reason =>
            highRiskPatterns.some(pattern => reason.includes(pattern))
        );

        return hasHighRisk ? 'HIGH' : 'MEDIUM';
    },

    // 📝 LOG DES TENTATIVES SUSPECTES
    logSuspiciousActivity: function (detection, additionalData = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: detection.ip,
            userAgent: detection.userAgent,
            riskLevel: detection.riskLevel,
            reasons: detection.reasons,
            blocked: true,
            ...additionalData
        };

        console.log('🚫 SPAM DÉTECTÉ:', JSON.stringify(logEntry, null, 2));

        // TODO: Sauvegarder dans un fichier de log ou base de données
        // fs.appendFileSync('logs/spam-attempts.log', JSON.stringify(logEntry) + '\n');
    }
};

module.exports = spamDetector;