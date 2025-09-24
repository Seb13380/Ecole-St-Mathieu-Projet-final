// Script d'analyse des dépendances pour déploiement VPS
const fs = require('fs');
const path = require('path');

async function analyzeVPSDependencies() {
    console.log('🔍 Analyse des dépendances pour déploiement VPS...\n');

    try {
        // 1. Analyser package.json
        console.log('1. 📦 Analyse du package.json :');
        const packagePath = path.join(__dirname, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            console.log('   Dependencies principales :');
            Object.entries(packageJson.dependencies || {}).forEach(([name, version]) => {
                console.log(`   - ${name}: ${version}`);
            });

            console.log('\n   DevDependencies :');
            Object.entries(packageJson.devDependencies || {}).forEach(([name, version]) => {
                console.log(`   - ${name}: ${version}`);
            });
        }

        // 2. Rechercher les nouvelles imports dans les fichiers modifiés
        console.log('\n2. 🔍 Recherche de nouvelles dépendances dans le code :');

        const filesToCheck = [
            'src/controllers/inscriptionController.js',
            'src/controllers/directeurController.js',
            'src/controllers/userManagementController.js'
        ];

        const foundImports = new Set();

        filesToCheck.forEach(file => {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');

                // Rechercher les require()
                const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g);
                if (requireMatches) {
                    requireMatches.forEach(match => {
                        const module = match.match(/require\(['"]([^'"]+)['"]\)/)[1];
                        if (!module.startsWith('.') && !module.startsWith('/')) {
                            foundImports.add(module);
                        }
                    });
                }

                // Rechercher les import
                const importMatches = content.match(/import .+ from ['"]([^'"]+)['"]/g);
                if (importMatches) {
                    importMatches.forEach(match => {
                        const module = match.match(/from ['"]([^'"]+)['"]/)[1];
                        if (!module.startsWith('.') && !module.startsWith('/')) {
                            foundImports.add(module);
                        }
                    });
                }

                console.log(`   📄 ${file} analysé`);
            }
        });

        console.log('\n   Modules trouvés dans le code :');
        foundImports.forEach(module => {
            console.log(`   - ${module}`);
        });

        // 3. Vérifier spécifiquement pour Excel/PDF
        console.log('\n3. 📊 Fonctionnalités spéciales détectées :');

        const specialFeatures = [];

        filesToCheck.forEach(file => {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');

                // Recherche Excel
                if (content.includes('xlsx') || content.includes('excel') || content.includes('ExcelJS')) {
                    specialFeatures.push('📊 Traitement Excel détecté');
                }

                // Recherche PDF
                if (content.includes('pdfkit') || content.includes('pdf') || content.includes('PDFDocument')) {
                    specialFeatures.push('📄 Génération PDF détectée');
                }

                // Recherche archivage
                if (content.includes('archiver') || content.includes('zip')) {
                    specialFeatures.push('📦 Archivage ZIP détecté');
                }

                // Recherche email
                if (content.includes('nodemailer') || content.includes('mail')) {
                    specialFeatures.push('📧 Envoi email détecté');
                }
            }
        });

        if (specialFeatures.length > 0) {
            specialFeatures.forEach(feature => console.log(`   ${feature}`));
        } else {
            console.log('   Aucune fonctionnalité spéciale détectée');
        }

        // 4. Recommandations VPS
        console.log('\n4. 🚀 Recommandations pour le VPS :');
        console.log('   📋 Commandes à exécuter sur le VPS :');
        console.log('   ```bash');
        console.log('   # 1. Mise à jour des packages Node.js');
        console.log('   npm install');
        console.log('   ');
        console.log('   # 2. Vérification des dépendances système (si nécessaire)');
        console.log('   # Pour PDFKit (si utilisé)');
        console.log('   sudo apt-get update');
        console.log('   sudo apt-get install -y libjpeg-dev libpng-dev');
        console.log('   ');
        console.log('   # 3. Régénération du client Prisma');
        console.log('   npx prisma generate');
        console.log('   ');
        console.log('   # 4. Vérification des migrations');
        console.log('   npx prisma migrate status');
        console.log('   ```');

        // 5. Checklist finale
        console.log('\n5. ✅ Checklist déploiement :');
        console.log('   □ Sauvegarder la base de données');
        console.log('   □ Sauvegarder les fichiers actuels');
        console.log('   □ Uploader les nouveaux fichiers');
        console.log('   □ Exécuter npm install');
        console.log('   □ Régénérer Prisma client');
        console.log('   □ Vérifier les migrations');
        console.log('   □ Redémarrer l\'application');
        console.log('   □ Tester toutes les fonctionnalités');

    } catch (error) {
        console.error('❌ Erreur lors de l\'analyse :', error);
    }
}

analyzeVPSDependencies();