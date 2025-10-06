/**
 * 🔍 DIAGNOSTIC URGENT - DOCUMENTS ET REJET
 */

const fs = require('fs');
const path = require('path');

async function diagnosticUrgent() {
    console.log('🚨 DIAGNOSTIC URGENT VPS');
    console.log('='.repeat(50));

    try {
        // 1. DIAGNOSTIC ESPACE DISQUE
        console.log('\n💾 ESPACE DISQUE:');
        console.log('Commande à exécuter: df -h');

        // 2. DIAGNOSTIC DOSSIERS UPLOADS
        console.log('\n📁 DOSSIERS UPLOADS:');
        const uploadDirs = [
            'uploads/documents',
            'public/uploads/documents',
            'uploads',
            'public/uploads'
        ];

        uploadDirs.forEach(dir => {
            const exists = fs.existsSync(dir);
            console.log(`   ${dir}: ${exists ? '✅ Existe' : '❌ Manquant'}`);
            
            if (exists) {
                try {
                    const files = fs.readdirSync(dir);
                    console.log(`     └─ ${files.length} fichiers`);
                } catch (error) {
                    console.log(`     └─ ❌ Erreur lecture: ${error.message}`);
                }
            }
        });

        // 3. DIAGNOSTIC PERMISSIONS
        console.log('\n🔐 PERMISSIONS:');
        console.log('Commandes à exécuter:');
        console.log('ls -la uploads/');
        console.log('ls -la uploads/documents/');
        console.log('whoami');

        // 4. DIAGNOSTIC MULTER/UPLOAD
        console.log('\n📤 CONFIGURATION UPLOAD:');
        console.log('Vérifier dans les logs PM2 les erreurs multer');

        // 5. COMMANDES DIAGNOSTIC VPS
        console.log('\n🔧 COMMANDES À EXÉCUTER SUR VPS:');
        console.log('# 1. Espace disque');
        console.log('df -h');
        console.log('');
        console.log('# 2. Permissions dossiers');
        console.log('ls -la uploads/ uploads/documents/');
        console.log('');
        console.log('# 3. Taille des dossiers');
        console.log('du -sh uploads/ public/uploads/');
        console.log('');
        console.log('# 4. Corriger permissions si nécessaire');
        console.log('chown -R www-data:www-data uploads/');
        console.log('chmod -R 755 uploads/');
        console.log('');
        console.log('# 5. Créer dossiers manquants');
        console.log('mkdir -p uploads/documents');
        console.log('mkdir -p public/uploads/documents');
        console.log('');
        console.log('# 6. Test route rejet');
        console.log('curl -X POST http://localhost:3000/directeur/inscriptions/24/reject \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"reason":"test diagnostic"}\' \\');
        console.log('  -v');

    } catch (error) {
        console.error('❌ Erreur diagnostic:', error.message);
    }
}

diagnosticUrgent();