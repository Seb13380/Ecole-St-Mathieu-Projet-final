# 🚀 GUIDE COMPLET - MISE EN PRODUCTION
## École Saint-Mathieu - ecolestmathieu.com

---

## 🔄 **ÉTAPE 1 : PRÉPARATION VPS (AVANT DNS)**

### A) Configuration Nginx
```bash
# 1. Créer la configuration du site
sudo nano /etc/nginx/sites-available/ecolestmathieu.com

# Contenu du fichier :
server {
    listen 80;
    server_name ecolestmathieu.com www.ecolestmathieu.com;
    
    # Redirection temporaire vers HTTPS une fois le SSL configuré
    # return 301 https://$server_name$request_uri;
    
    # Configuration temporaire pour les tests
    location / {
        proxy_pass http://localhost:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 2. Activer le site
sudo ln -s /etc/nginx/sites-available/ecolestmathieu.com /etc/nginx/sites-enabled/

# 3. Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### B) Variables d'environnement production
```bash
# Modifier le fichier .env
cd /var/www/ecole-st-mathieu
sudo nano .env

# Mettre à jour :
NODE_ENV=production
BASE_URL=https://ecolestmathieu.com
CORS_ORIGIN=https://ecolestmathieu.com,https://www.ecolestmathieu.com
```

---

## 🌐 **ÉTAPE 2 : CONFIGURATION DNS CHEZ IONOS**

### A) Connexion IONOS
1. Se connecter sur : https://www.ionos.fr
2. Aller dans "Domaines" > "ecolestmathieu.com"
3. Cliquer sur "DNS"

### B) Configuration des enregistrements DNS
```
Type    Nom             Valeur                  TTL
A       @               [IP_DE_VOTRE_VPS]      3600
A       www             [IP_DE_VOTRE_VPS]      3600
CNAME   mail            @                       3600
MX      @               mail.ecolestmathieu.com 3600 (priorité 10)
```

**⚠️ IMPORTANT :** Remplacer [IP_DE_VOTRE_VPS] par l'IP réelle de votre serveur

### C) Temps de propagation
- Attendre 24-48h pour propagation complète
- Tester avec : `nslookup ecolestmathieu.com`

---

## 🔒 **ÉTAPE 3 : SÉCURISATION SSL/HTTPS**

### A) Installation Certbot
```bash
# 1. Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. Générer le certificat SSL
sudo certbot --nginx -d ecolestmathieu.com -d www.ecolestmathieu.com

# 3. Test de renouvellement automatique
sudo certbot renew --dry-run
```

### B) Configuration finale Nginx (après SSL)
```bash
# Le fichier sera automatiquement modifié par Certbot
# Vérifier que la redirection HTTPS est active
sudo nano /etc/nginx/sites-available/ecolestmathieu.com
```

---

## 📧 **ÉTAPE 4 : CONFIGURATION EMAIL**

### A) Récupération email Lionel (depuis eMonSite)
**Chez eMonSite :**
1. Se connecter sur l'ancien compte eMonSite
2. Aller dans "Configuration" > "Emails"
3. Noter la configuration actuelle :
   - Serveur SMTP sortant
   - Port (587 ou 465)
   - Authentification
4. **SAUVEGARDER** tous les emails existants
5. Exporter les contacts si possible

### B) Configuration email chez IONOS
**Étape 1 : Créer les boîtes email**
1. IONOS > "Email & Office" > "Créer une adresse email"
2. Créer : `l.camboulives@ecolestmathieu.com`
3. Créer : `contact@ecolestmathieu.com` (optionnel)
4. Créer : `admin@ecolestmathieu.com` (optionnel)

**Étape 2 : Configuration SMTP/IMAP**
```
Serveur IMAP : imap.ionos.fr
Port IMAP : 993 (SSL)
Serveur SMTP : smtp.ionos.fr  
Port SMTP : 587 (STARTTLS) ou 465 (SSL)
Authentification : Nom d'utilisateur complet + mot de passe
```

### C) Migration des emails
**Option 1 : Redirection temporaire**
- Configurer une redirection depuis l'ancien email vers le nouveau
- Durée : 1-2 mois pour transition

**Option 2 : Migration manuelle**
- Utiliser un client email (Thunderbird, Outlook)
- Configurer les 2 comptes simultanément
- Déplacer les emails importants

---

## ⚙️ **ÉTAPE 5 : CONFIGURATION APPLICATION**

### A) Paramètres email dans l'application
```javascript
// Dans config/email.js ou .env
SMTP_HOST=smtp.ionos.fr
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=l.camboulives@ecolestmathieu.com
SMTP_PASS=[mot_de_passe_lionel]

// Email de Frank pour notifications
NOTIFICATION_EMAIL=frank.quaracino@orange.fr
ADMIN_EMAIL=l.camboulives@ecolestmathieu.com
```

### B) Test des emails
```bash
# Tester l'envoi d'email depuis l'application
# Vérifier les formulaires de contact
# Tester les notifications d'inscription
```

---

## 🔐 **ÉTAPE 6 : SÉCURITÉ RENFORCÉE**

### A) Pare-feu (UFW)
```bash
# Configuration UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3007  # Port Node.js (temporaire pour tests)
sudo ufw --force enable
sudo ufw status
```

### B) Sécurisation SSH
```bash
# Modifier la configuration SSH
sudo nano /etc/ssh/sshd_config

# Recommandations :
Port 2222  # Changer le port par défaut
PermitRootLogin no
PasswordAuthentication yes  # Garder activé pour le moment
MaxAuthTries 3

sudo systemctl restart sshd
```

### C) Monitoring et logs
```bash
# Installer fail2ban
sudo apt install fail2ban

# Configuration basique
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🧪 **ÉTAPE 7 : TESTS ET VALIDATION**

### A) Tests fonctionnels
- [ ] Accès au site via ecolestmathieu.com
- [ ] Redirection HTTPS automatique
- [ ] Tous les menus et pages fonctionnent
- [ ] Formulaires de contact opérationnels
- [ ] Dashboard d'administration accessible
- [ ] Upload d'images fonctionnel

### B) Tests emails
- [ ] Envoi depuis formulaire de contact
- [ ] Réception sur frank.quaracino@orange.fr
- [ ] Notifications d'inscription
- [ ] Emails automatiques fonctionnels

### C) Tests de performance
```bash
# Test de charge basique
curl -I https://ecolestmathieu.com
# Vérifier les temps de réponse
```

---

## 📱 **ÉTAPE 8 : COMMUNICATION ET TRANSITION**

### A) Information des utilisateurs
- [ ] Prévenir Lionel du changement d'URL
- [ ] Informer Frank de la nouvelle configuration
- [ ] Mettre à jour les supports de communication
- [ ] Informer les parents si nécessaire

### B) Sauvegarde finale
```bash
# Sauvegarde complète avant mise en production
sudo systemctl stop ecolestmathieu
pg_dump ecole_db > backup_production_$(date +%Y%m%d).sql
tar -czf backup_app_$(date +%Y%m%d).tar.gz /var/www/ecole-st-mathieu
sudo systemctl start ecolestmathieu
```

---

## ⏰ **PLANNING RECOMMANDÉ**

### Jour J-2 (Préparation)
- Configuration VPS et Nginx
- Préparation des certificats SSL
- Tests internes

### Jour J-1 (DNS)
- Modification DNS chez IONOS
- Début propagation
- Tests progressifs

### Jour J (Mise en production)
- Activation SSL
- Configuration emails
- Tests complets
- Communication officielle

### Jour J+1 (Suivi)
- Monitoring des accès
- Vérification emails
- Support utilisateurs

---

## 🆘 **CONTACTS D'URGENCE**

**Support technique :**
- IONOS : 09 70 80 89 89
- VPS Provider : [selon votre hébergeur]

**Emails de test :**
- Lionel : l.camboulives@ecolestmathieu.com (nouveau)
- Frank : frank.quaracino@orange.fr (existant)
- Contact site : contact@ecolestmathieu.com (nouveau)

---

## 📝 **CHECKLIST FINALE**

### Technique
- [ ] DNS configuré et propagé
- [ ] SSL/HTTPS actif
- [ ] Application accessible
- [ ] Emails fonctionnels
- [ ] Sauvegardes créées

### Utilisateurs
- [ ] Lionel informé et formé
- [ ] Frank configuré pour réception
- [ ] Accès administrateur testé
- [ ] Documentation fournie

### Sécurité
- [ ] Pare-feu configuré
- [ ] SSH sécurisé
- [ ] Certificats SSL valides
- [ ] Monitoring actif

---

**🎉 FÉLICITATIONS ! Votre site est maintenant en production !**
