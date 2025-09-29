#!/bin/bash

# 🛡️ SCRIPT DE DÉPLOIEMENT SÉCURISÉ VPS
# Synchronise la base VPS SANS PERTE DE DONNÉES

echo "🛡️ DÉPLOIEMENT SÉCURISÉ - SYNCHRONISATION VPS"
echo "=============================================="

# 1. SAUVEGARDE OBLIGATOIRE
echo "📦 ÉTAPE 1: Sauvegarde de sécurité"
mysqldump -u root -p ecole_st_mathieu > backup_before_sync_$(date +%Y%m%d_%H%M%S).sql
echo "✅ Sauvegarde créée"

# 2. VÉRIFICATION DES DONNÉES EXISTANTES
echo "📊 ÉTAPE 2: Inventaire des données"
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function inventory() {
  const users = await prisma.user.count();
  const students = await prisma.student.count();
  const classes = await prisma.classe.count();
  const preInscriptions = await prisma.preInscriptionRequest.count();
  const dossiers = await prisma.dossierInscription.count();
  console.log('INVENTAIRE AVANT SYNC:');
  console.log('- Users:', users);
  console.log('- Students:', students); 
  console.log('- Classes:', classes);
  console.log('- PreInscriptions:', preInscriptions);
  console.log('- Dossiers:', dossiers);
  await prisma.\$disconnect();
}
inventory().catch(console.error);
"

# 3. APPLICATION DES MIGRATIONS DE MANIÈRE SÉCURISÉE
echo "🔄 ÉTAPE 3: Application des migrations"

# Vérifier si la table credentials_requests existe
echo "Vérification table credentials_requests..."
mysql -u root -p -e "DESCRIBE ecole_st_mathieu.credentials_requests;" 2>/dev/null || {
    echo "❌ Table credentials_requests manquante - création nécessaire"
    NEED_CREDENTIALS_TABLE=true
}

# Vérifier si parentId est nullable
echo "Vérification colonne parentId..."
mysql -u root -p -e "DESCRIBE ecole_st_mathieu.students;" | grep parentId | grep -q "YES" || {
    echo "❌ parentId non-nullable - modification nécessaire"
    NEED_PARENTID_NULLABLE=true
}

# Application progressive des changements
if [ "$NEED_CREDENTIALS_TABLE" = true ]; then
    echo "🔧 Création de la table credentials_requests..."
    npx prisma db push --accept-data-loss=false
fi

if [ "$NEED_PARENTID_NULLABLE" = true ]; then
    echo "🔧 Modification parentId vers nullable..."
    mysql -u root -p -e "ALTER TABLE ecole_st_mathieu.students MODIFY parentId INT NULL;"
fi

# 4. GÉNÉRATION DU CLIENT PRISMA
echo "⚙️ ÉTAPE 4: Génération du client Prisma"
npx prisma generate

# 5. REDÉMARRAGE DE L'APPLICATION
echo "🔄 ÉTAPE 5: Redémarrage application"
pm2 restart ecole

# 6. VÉRIFICATION POST-DÉPLOIEMENT
echo "✅ ÉTAPE 6: Vérification finale"
sleep 3
pm2 logs ecole --lines 10

echo ""
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "🔍 Vérifiez les logs ci-dessus"
echo "📂 Sauvegarde disponible dans backup_before_sync_*.sql"