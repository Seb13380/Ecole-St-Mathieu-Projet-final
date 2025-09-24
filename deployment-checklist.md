# Plan de déploiement VPS - École St Mathieu

## 🎯 Objectifs
- Déployer toutes les modifications sans perte de données
- Mettre à jour le schéma Prisma en production
- Préserver les données existantes (utilisateurs, inscriptions, menus)

## 📦 Fichiers modifiés à déployer
- `src/controllers/inscriptionController.js` (gestion unifiée des inscriptions)
- `src/controllers/directeurController.js` (vue unifiée rendez-vous)
- `src/controllers/userManagementController.js` (gestion parents/relations)
- `src/views/pages/directeur/rendez-vous-inscriptions.twig` (suppression alertes)
- `prisma/schema.prisma` (si modifié)

## 🚀 Étapes de déploiement

### Phase 1: Sauvegarde (CRITIQUE)
```bash
# Sur le VPS - Sauvegarde complète de la base
mysqldump -u [user] -p ecole_st_mathieu > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde des fichiers actuels
cp -r /var/www/ecole-st-mathieu /var/www/ecole-st-mathieu-backup-$(date +%Y%m%d)
```

### Phase 2: Vérification Prisma
```bash
# Vérifier l'état actuel des migrations
npx prisma migrate status

# Générer le client Prisma avec le nouveau schéma
npx prisma generate
```

### Phase 3: Déploiement des fichiers
```bash
# Upload des fichiers modifiés via SCP/SFTP
# Redémarrage des services
```

### Phase 4: Tests post-déploiement
- [ ] Test inscription nouvelle demande
- [ ] Test finalisation demande
- [ ] Test gestion parents
- [ ] Test affichage menus
- [ ] Vérification logs erreurs

## ⚠️ Points critiques
1. **TOUJOURS** sauvegarder avant toute modification
2. Vérifier que les migrations Prisma sont compatibles
3. Tester en mode maintenance si possible
4. Garder une stratégie de rollback

## 🔄 Plan de rollback
En cas de problème :
1. Arrêter l'application
2. Restaurer les fichiers depuis backup
3. Restaurer la base de données depuis dump SQL
4. Redémarrer les services