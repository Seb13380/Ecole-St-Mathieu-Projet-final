# Guide complet de déploiement VPS - École St Mathieu

## 🎯 Résumé des modifications récentes

### Fonctionnalités ajoutées/modifiées :
- ✅ **Import Excel** : Traitement fichiers .xlsx/.xls (package `xlsx`)
- ✅ **Génération PDF** : PDFKit avec archivage (déjà installé)
- ✅ **Gestion unifiée inscriptions** : PreInscriptionRequest + DossierInscription
- ✅ **Relations parents** : ParentStudent + relations directes
- ✅ **Système menus** : Gestion PDF avec synchronisation base

### Fichiers critiques modifiés :
1. `src/controllers/inscriptionController.js` - Logique unifiée
2. `src/controllers/directeurController.js` - Import Excel + vue unifiée
3. `src/controllers/userManagementController.js` - Relations parents
4. `src/views/pages/directeur/rendez-vous-inscriptions.twig` - Interface sans alertes

## 🚀 Procédure de déploiement complète

### Phase 1: Préparation et sauvegarde (CRITIQUE!)

```bash
# Sur le VPS - Connexion SSH
ssh user@votre-vps.com

# 1. Arrêter l'application (si elle tourne)
sudo systemctl stop ecole-st-mathieu  # ou pm2 stop all

# 2. Sauvegarde complète base de données
mysqldump -u root -p ecole_st_mathieu > /var/backups/ecole_$(date +%Y%m%d_%H%M%S).sql

# 3. Sauvegarde fichiers application
cp -r /var/www/ecole-st-mathieu /var/backups/ecole-files-$(date +%Y%m%d_%H%M%S)

# 4. Sauvegarde .env et prisma
cp /var/www/ecole-st-mathieu/.env /var/backups/
cp /var/www/ecole-st-mathieu/prisma/schema.prisma /var/backups/schema-backup.prisma
```

### Phase 2: Upload des nouveaux fichiers

```bash
# Depuis votre PC local (PowerShell/CMD)
# Adapter les chemins selon votre configuration

# Upload via SCP (à adapter selon votre configuration)
scp "c:\Documents\RI7\Ecole St Mathieu Projet final\src\controllers\inscriptionController.js" user@vps:/var/www/ecole-st-mathieu/src/controllers/
scp "c:\Documents\RI7\Ecole St Mathieu Projet final\src\controllers\directeurController.js" user@vps:/var/www/ecole-st-mathieu/src/controllers/
scp "c:\Documents\RI7\Ecole St Mathieu Projet final\src\controllers\userManagementController.js" user@vps:/var/www/ecole-st-mathieu/src/controllers/
scp "c:\Documents\RI7\Ecole St Mathieu Projet final\src\views\pages\directeur\rendez-vous-inscriptions.twig" user@vps:/var/www/ecole-st-mathieu/src/views/pages/directeur/

# Si schema.prisma a été modifié
scp "c:\Documents\RI7\Ecole St Mathieu Projet final\prisma\schema.prisma" user@vps:/var/www/ecole-st-mathieu/prisma/

# Package.json si nouvelles dépendances
scp "c:\Documents\RI7\Ecole St Mathieu Projet final\package.json" user@vps:/var/www/ecole-st-mathieu/
```

### Phase 3: Installation et mise à jour

```bash
# Retour sur le VPS
cd /var/www/ecole-st-mathieu

# 1. Vérifier Node.js version (doit être >= 18)
node --version
npm --version

# 2. Installation des dépendances (inclut xlsx si nouveau)
npm install

# 3. Vérifications spéciales pour dépendances système
# Pour PDFKit et manipulation images
sudo apt-get update
sudo apt-get install -y libjpeg-dev libpng-dev libcairo2-dev libpango1.0-dev libgif-dev

# 4. Prisma - Vérifier l'état des migrations
npx prisma migrate status

# Si des migrations sont en attente :
npx prisma migrate deploy

# 5. Régénérer le client Prisma
npx prisma generate

# 6. Vérifier les permissions des dossiers
sudo chown -R www-data:www-data /var/www/ecole-st-mathieu
sudo chmod -R 755 /var/www/ecole-st-mathieu
```

### Phase 4: Tests avant redémarrage

```bash
# 1. Test connexion base de données
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Base de données OK');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur base:', err);
  process.exit(1);
});
"

# 2. Vérifier que les fichiers sont bien en place
ls -la src/controllers/inscriptionController.js
ls -la src/controllers/directeurController.js
ls -la src/controllers/userManagementController.js

# 3. Test syntax JavaScript (optionnel)
node -c src/controllers/inscriptionController.js
node -c src/controllers/directeurController.js
node -c src/controllers/userManagementController.js
```

### Phase 5: Redémarrage application

```bash
# Selon votre méthode de déploiement :

# Option A: SystemD
sudo systemctl start ecole-st-mathieu
sudo systemctl status ecole-st-mathieu

# Option B: PM2
pm2 start app.js --name ecole-st-mathieu
pm2 status

# Option C: Forever
forever start app.js

# Vérifier les logs
tail -f /var/log/ecole-st-mathieu.log  # ou chemin de vos logs
# ou
pm2 logs ecole-st-mathieu
```

### Phase 6: Tests fonctionnels complets

```bash
# 1. Vérifier que l'application répond
curl -I http://localhost:3007

# 2. Tester les pages principales
curl http://localhost:3007/login
curl http://localhost:3007/directeur/dashboard
```

## ✅ Checklist post-déploiement

### Tests interface utilisateur :
- [ ] **Page login** fonctionne
- [ ] **Dashboard directeur** s'affiche
- [ ] **Rendez-vous inscriptions** - Liste unifiée visible
- [ ] **Finalisation inscription** - Sans alertes, page se rafraîchit
- [ ] **Import Excel** - Upload et traitement fichier .xlsx
- [ ] **Gestion parents** - Modification/suppression parents
- [ ] **Menus restauration** - Affichage PDF correct
- [ ] **Génération PDF** - Création dossiers sans erreur

### Vérifications techniques :
- [ ] Logs sans erreurs critiques
- [ ] Base de données répond
- [ ] Fichiers uploadés correctement
- [ ] Permissions correctes

## 🚨 Plan de rollback d'urgence

Si problème critique :

```bash
# 1. Arrêter application
sudo systemctl stop ecole-st-mathieu

# 2. Restaurer fichiers
rm -rf /var/www/ecole-st-mathieu
cp -r /var/backups/ecole-files-[DATE] /var/www/ecole-st-mathieu

# 3. Restaurer base de données
mysql -u root -p ecole_st_mathieu < /var/backups/ecole_[DATE].sql

# 4. Redémarrer
sudo systemctl start ecole-st-mathieu
```

## 📋 Notes importantes

### Nouvelles dépendances confirmées :
- `xlsx`: ^0.18.5 (traitement fichiers Excel)
- Toutes les autres sont déjà présentes

### Fonctionnalités critiques testées :
- Import Excel avec validation
- Génération PDF avec archivage
- Gestion unifiée des inscriptions
- Relations parents-enfants multiples

### Monitoring post-déploiement :
- Surveiller logs première semaine
- Vérifier performance import Excel
- Tester génération PDF sur gros volumes
- Valider synchronisation menus-fichiers