const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugImportExcel() {
    console.log('🔍 Debug de l\'import Excel - Simulation avec données de test...\n');

    try {
        // Simulation d'une ligne du fichier Excel
        const testData = {
            responsable1: 'M. DUPONT Jean',
            tel1: '0123456789',
            email1: 'jean.dupont@email.com',
            responsable2: 'Mme DUPONT Marie',
            tel2: '0987654321',
            email2: 'marie.dupont@email.com',
            adresse: '123 rue de Test',
            codePostalVille: '13000 Marseille',
            enfantNom: 'DUPONT Pierre',
            dateNaissance: new Date('2018-05-15'),
            codeClasse: '4-CP'
        };

        console.log('📋 Données de test simulées:');
        console.log(testData);
        console.log('\n');

        // 1. Tester l'analyse du père
        const resp1Match = testData.responsable1.match(/^(M\.|Mme)\s+(.+)$/);
        if (resp1Match) {
            const civilite = resp1Match[1];
            const nomComplet = resp1Match[2];
            const nomParts = nomComplet.trim().split(' ');

            const isAllUpperCase = (word) => word === word.toUpperCase() && word !== word.toLowerCase();

            let nom, prenom;

            if (nomParts.length >= 2) {
                const upperCaseWords = [];
                const normalCaseWords = [];

                nomParts.forEach(word => {
                    if (isAllUpperCase(word)) {
                        upperCaseWords.push(word);
                    } else {
                        normalCaseWords.push(word);
                    }
                });

                if (upperCaseWords.length > 0 && normalCaseWords.length > 0) {
                    nom = upperCaseWords.join(' ');
                    prenom = normalCaseWords.join(' ');
                } else if (nomParts.length >= 2) {
                    prenom = nomParts[nomParts.length - 1];
                    nom = nomParts.slice(0, -1).join(' ');
                } else {
                    nom = nomParts[0];
                    prenom = 'Non renseigné';
                }
            }

            console.log('👨 Analyse du père:');
            console.log(`   Civilité: ${civilite}`);
            console.log(`   Nom complet: "${nomComplet}"`);
            console.log(`   → Nom: "${nom}", Prénom: "${prenom}"`);
            console.log(`   Email: ${testData.email1}`);
            console.log(`   Téléphone: ${testData.tel1}`);
        }

        // 2. Tester l'analyse de l'enfant
        const enfantParts = testData.enfantNom.trim().split(' ');
        const isAllUpperCase = (word) => word === word.toUpperCase() && word !== word.toLowerCase();

        let enfantNom, enfantPrenom;

        if (enfantParts.length >= 2) {
            const upperCaseWords = [];
            const normalCaseWords = [];

            enfantParts.forEach(word => {
                if (isAllUpperCase(word)) {
                    upperCaseWords.push(word);
                } else {
                    normalCaseWords.push(word);
                }
            });

            if (upperCaseWords.length > 0 && normalCaseWords.length > 0) {
                enfantNom = upperCaseWords.join(' ');
                enfantPrenom = normalCaseWords.join(' ');
            } else if (enfantParts.length >= 2) {
                enfantPrenom = enfantParts[enfantParts.length - 1];
                enfantNom = enfantParts.slice(0, -1).join(' ');
            }
        }

        console.log('\n👶 Analyse de l\'enfant:');
        console.log(`   Nom complet: "${testData.enfantNom}"`);
        console.log(`   → Nom: "${enfantNom}", Prénom: "${enfantPrenom}"`);
        console.log(`   Date naissance: ${testData.dateNaissance}`);
        console.log(`   Code classe: ${testData.codeClasse}`);

        // 3. Vérifier si la classe existe
        const classe = await prisma.classe.findFirst({
            where: { nom: testData.codeClasse }
        });

        console.log('\n🏫 Vérification de la classe:');
        if (classe) {
            console.log(`   ✅ Classe "${testData.codeClasse}" trouvée (ID: ${classe.id})`);
        } else {
            console.log(`   ❌ Classe "${testData.codeClasse}" non trouvée`);

            // Lister les classes disponibles qui pourraient correspondre
            const allClasses = await prisma.classe.findMany({
                select: { id: true, nom: true, niveau: true }
            });
            console.log('   📋 Classes disponibles:');
            allClasses.forEach(c => {
                console.log(`      - ID ${c.id}: "${c.nom}" (niveau: ${c.niveau})`);
            });
        }

        // 4. Tester les validations
        const enfant = {
            firstName: enfantPrenom,
            lastName: enfantNom,
            dateNaissance: testData.dateNaissance,
            codeClasse: testData.codeClasse
        };

        console.log('\n🔍 Validation des données enfant:');
        console.log(`   firstName: "${enfant.firstName}" ${enfant.firstName ? '✅' : '❌'}`);
        console.log(`   lastName: "${enfant.lastName}" ${enfant.lastName ? '✅' : '❌'}`);
        console.log(`   dateNaissance: ${enfant.dateNaissance} ${enfant.dateNaissance ? '✅' : '❌'}`);
        console.log(`   codeClasse: "${enfant.codeClasse}" ${enfant.codeClasse ? '✅' : '❌'}`);

        const isValid = enfant.firstName && enfant.lastName && enfant.codeClasse;
        console.log(`\n   → Validation globale: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

        if (!isValid) {
            console.log('\n❌ PROBLÈME IDENTIFIÉ: Données enfant incomplètes');
            if (!enfant.firstName) console.log('   - firstName manquant ou vide');
            if (!enfant.lastName) console.log('   - lastName manquant ou vide');
            if (!enfant.codeClasse) console.log('   - codeClasse manquant ou vide');
        }

        // 5. Si la validation réussit, tester la création (sans vraiment créer)
        if (isValid && classe) {
            console.log('\n🧪 Test de création (simulation):');
            console.log('   Données qui seraient envoyées à Prisma:');
            console.log('   {');
            console.log(`     firstName: "${enfant.firstName}",`);
            console.log(`     lastName: "${enfant.lastName}",`);
            console.log(`     dateNaissance: ${enfant.dateNaissance},`);
            console.log(`     classeId: ${classe.id}`);
            console.log('   }');

            // Vérifier les types
            console.log('\n   Vérification des types:');
            console.log(`   - firstName: ${typeof enfant.firstName} ${typeof enfant.firstName === 'string' ? '✅' : '❌'}`);
            console.log(`   - lastName: ${typeof enfant.lastName} ${typeof enfant.lastName === 'string' ? '✅' : '❌'}`);
            console.log(`   - dateNaissance: ${typeof enfant.dateNaissance} ${enfant.dateNaissance instanceof Date ? '✅' : '❌'}`);
            console.log(`   - classeId: ${typeof classe.id} ${typeof classe.id === 'number' ? '✅' : '❌'}`);
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('\n❌ Erreur dans le diagnostic:', error);
        await prisma.$disconnect();
    }
}

debugImportExcel();