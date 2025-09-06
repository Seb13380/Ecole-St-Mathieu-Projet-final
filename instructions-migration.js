#!/usr/bin/env node

console.log('🔧 === MIGRATION MANUELLE BASE DE DONNÉES ===');
console.log('===========================================\n');

console.log('📋 PROBLÈME IDENTIFIÉ:');
console.log('Les colonnes externalUrl et isExternalLink manquent dans la table Document\n');

console.log('💡 SOLUTIONS POSSIBLES:');
console.log('======================\n');

console.log('1️⃣ VIA MYSQL WORKBENCH:');
console.log('   • Ouvre MySQL Workbench');
console.log('   • Connecte-toi à ta base ecole_st_mathieu');
console.log('   • Ouvre le fichier: migration-add-external-url.sql');
console.log('   • Exécute le script SQL\n');

console.log('2️⃣ VIA LIGNE DE COMMANDE:');
console.log('   mysql -u root -p ecole_st_mathieu < migration-add-external-url.sql\n');

console.log('3️⃣ VIA PHPMYADMIN:');
console.log('   • Va dans phpMyAdmin');
console.log('   • Sélectionne la base ecole_st_mathieu');
console.log('   • Onglet SQL');
console.log('   • Copie-colle le contenu du fichier migration-add-external-url.sql\n');

console.log('📄 CONTENU DU SCRIPT SQL:');
console.log('=========================');
console.log('ALTER TABLE Document ADD COLUMN externalUrl VARCHAR(500) NULL;');
console.log('ALTER TABLE Document ADD COLUMN isExternalLink BOOLEAN NOT NULL DEFAULT FALSE;\n');

console.log('✅ APRÈS LA MIGRATION:');
console.log('======================');
console.log('• Redémarre le serveur: npm start');
console.log('• Teste /documents/admin');
console.log('• Teste /documents/ecole\n');

console.log('🚨 NOTE IMPORTANTE:');
console.log('Ces colonnes sont nécessaires pour le système de liens externes');
console.log('que nous avons ajouté aux documents officiels.');
