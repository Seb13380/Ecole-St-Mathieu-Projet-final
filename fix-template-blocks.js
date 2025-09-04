#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function findAndFixTemplateBlocks() {
    console.log('🔧 CORRECTION DES BLOCS DE TEMPLATES\n');

    // Mapping des layouts et leurs blocs
    const layoutBlocks = {
        'layouts/base.twig': 'main',
        'layouts/main.twig': 'content',
        'layouts/admin.twig': 'content',
        'layouts/auth.twig': 'content'
    };

    console.log('📋 Structure des layouts:');
    Object.entries(layoutBlocks).forEach(([layout, block]) => {
        console.log(`   • ${layout} → {% block ${block} %}`);
    });

    console.log('\n🔍 Recherche des templates à corriger...');

    // Chercher tous les fichiers .twig dans pages/
    const findCommand = 'find src/views/pages -name "*.twig" -type f';

    exec(findCommand, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Erreur find:', error);
            // Fallback pour Windows
            checkTemplatesManually();
            return;
        }

        const files = stdout.trim().split('\n').filter(f => f.length > 0);
        console.log(`📄 ${files.length} templates trouvés`);

        files.forEach(file => {
            checkAndFixTemplate(file);
        });
    });
}

function checkTemplatesManually() {
    // Liste manuelle des templates problématiques probables
    const problematicTemplates = [
        'src/views/pages/directeur/credentials.twig',
        'src/views/pages/admin/users.twig',
        'src/views/pages/admin/students.twig',
        'src/views/pages/admin/settings.twig',
        'src/views/pages/admin/reports.twig',
        'src/views/pages/inscription-eleve.twig'
    ];

    console.log('🔧 Vérification manuelle des templates...');

    problematicTemplates.forEach(file => {
        if (fs.existsSync(file)) {
            checkAndFixTemplate(file);
        }
    });
}

function checkAndFixTemplate(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Trouver la ligne extends
        const extendsLine = lines.find(line => line.trim().startsWith('{% extends'));
        if (!extendsLine) return;

        // Extraire le layout
        const layoutMatch = extendsLine.match(/extends\s+"([^"]+)"/);
        if (!layoutMatch) return;

        const layout = layoutMatch[1];

        // Déterminer le bon bloc
        let expectedBlock = 'main'; // défaut pour base.twig
        if (layout.includes('main.twig')) expectedBlock = 'content';
        if (layout.includes('admin.twig')) expectedBlock = 'content';
        if (layout.includes('auth.twig')) expectedBlock = 'content';

        // Trouver les blocs actuels
        const blockMatches = content.match(/{%\s*block\s+(\w+)\s*%}/g);
        if (!blockMatches) return;

        let needsFix = false;
        const currentBlocks = blockMatches.map(match => {
            const blockMatch = match.match(/{%\s*block\s+(\w+)\s*%}/);
            return blockMatch ? blockMatch[1] : null;
        }).filter(Boolean);

        // Vérifier si un bloc de contenu utilise le mauvais nom
        const contentBlocks = currentBlocks.filter(block =>
            block === 'main' || block === 'content'
        );

        if (contentBlocks.length > 0) {
            const currentContentBlock = contentBlocks[0];
            if (currentContentBlock !== expectedBlock) {
                needsFix = true;
                console.log(`🔧 ${filePath}:`);
                console.log(`   Layout: ${layout}`);
                console.log(`   Actuel: {% block ${currentContentBlock} %}`);
                console.log(`   Attendu: {% block ${expectedBlock} %}`);

                // Effectuer la correction
                let newContent = content.replace(
                    new RegExp(`{%\\s*block\\s+${currentContentBlock}\\s*%}`, 'g'),
                    `{% block ${expectedBlock} %}`
                );

                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`   ✅ Corrigé!`);
            }
        }

    } catch (error) {
        console.error(`❌ Erreur avec ${filePath}:`, error.message);
    }
}

// Exécuter la correction
findAndFixTemplateBlocks();
