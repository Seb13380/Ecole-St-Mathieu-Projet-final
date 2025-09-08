#!/usr/bin/env node

console.log('ðŸ”§ === MIGRATION MANUELLE BASE DE DONNÃ‰ES ===');
console.log('=\n');

console.log('ðŸ“‹ PROBLÃˆME IDENTIFIÃ‰:');
console.log('Les colonnes externalUrl et isExternalLink manquent dans la table Document\n');

console.log('ðŸ’¡ SOLUTIONS POSSIBLES:');
console.log('=\n');

console.log('1ï¸âƒ£ VIA MYSQL WORKBENCH:');
console.log('   â€¢ Ouvre MySQL Workbench');
console.log('   â€¢ Connecte-toi Ã  ta base ecole_st_mathieu');
console.log('   â€¢ Ouvre le fichier: migration-add-external-url.sql');
console.log('   â€¢ ExÃ©cute le script SQL\n');

console.log('2ï¸âƒ£ VIA LIGNE DE COMMANDE:');
console.log('   mysql -u root -p ecole_st_mathieu < migration-add-external-url.sql\n');

console.log('3ï¸âƒ£ VIA PHPMYADMIN:');
console.log('   â€¢ Va dans phpMyAdmin');
console.log('   â€¢ SÃ©lectionne la base ecole_st_mathieu');
console.log('   â€¢ Onglet SQL');
console.log('   â€¢ Copie-colle le contenu du fichier migration-add-external-url.sql\n');

console.log('ðŸ“„ CONTENU DU SCRIPT SQL:');
console.log('====');
console.log('ALTER TABLE Document ADD COLUMN externalUrl VARCHAR(500) NULL;');
console.log('ALTER TABLE Document ADD COLUMN isExternalLink BOOLEAN NOT NULL DEFAULT FALSE;\n');

console.log('âœ… APRÃˆS LA MIGRATION:');
console.log('=');
console.log('â€¢ RedÃ©marre le serveur: npm start');
console.log('â€¢ Teste /documents/admin');
console.log('â€¢ Teste /documents/ecole\n');

console.log('ðŸš¨ NOTE IMPORTANTE:');
console.log('Ces colonnes sont nÃ©cessaires pour le systÃ¨me de liens externes');
console.log('que nous avons ajoutÃ© aux documents officiels.');

