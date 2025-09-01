const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createBasicSchoolData() {
    try {
        console.log('🏫 Création des données de base de l\'école...');

        // === CRÉATION DES CLASSES ===
        console.log('\n📚 Création des classes...');
        
        const classesToCreate = [
            { nom: 'PS-A', niveau: 'PS', anneeScolaire: '2025-2026' },
            { nom: 'MS-A', niveau: 'MS', anneeScolaire: '2025-2026' },
            { nom: 'GS-A', niveau: 'GS', anneeScolaire: '2025-2026' },
            { nom: 'CP-A', niveau: 'CP', anneeScolaire: '2025-2026' },
            { nom: 'CE1-A', niveau: 'CE1', anneeScolaire: '2025-2026' },
            { nom: 'CE2-A', niveau: 'CE2', anneeScolaire: '2025-2026' },
            { nom: 'CM1-A', niveau: 'CM1', anneeScolaire: '2025-2026' },
            { nom: 'CM2-A', niveau: 'CM2', anneeScolaire: '2025-2026' }
        ];

        const createdClasses = [];
        for (const classeData of classesToCreate) {
            const existingClasse = await prisma.classe.findFirst({
                where: { nom: classeData.nom }
            });

            if (!existingClasse) {
                const classe = await prisma.classe.create({
                    data: classeData
                });
                createdClasses.push(classe);
                console.log(`✅ Classe créée: ${classe.nom} (${classe.niveau})`);
            } else {
                console.log(`⚠️  Classe ${classeData.nom} existe déjà`);
                createdClasses.push(existingClasse);
            }
        }

        // === CRÉATION DE YAMINA (SECRÉTAIRE) ===
        console.log('\n👩‍💼 Création de Yamina (Secrétaire de Direction)...');
        
        const yaminaEmail = 'yamina.secretaire@stmathieu.org';
        const yaminaPassword = await bcrypt.hash('Yamina123!', 10);

        const existingYamina = await prisma.user.findUnique({
            where: { email: yaminaEmail }
        });

        if (!existingYamina) {
            const yamina = await prisma.user.create({
                data: {
                    firstName: 'Yamina',
                    lastName: 'Secrétaire Direction',
                    email: yaminaEmail,
                    password: yaminaPassword,
                    phone: '04.91.23.45.67',
                    adress: 'École Saint-Mathieu',
                    role: 'SECRETAIRE_DIRECTION'
                }
            });
            console.log('✅ Yamina créée avec succès !');
        } else {
            console.log('⚠️  Yamina existe déjà');
        }

        // === CRÉATION D'ÉLÈVES D'EXEMPLE ===
        console.log('\n👶 Création d\'élèves d\'exemple...');
        
        // Créer des parents d'exemple
        const parentsExemple = [
            {
                firstName: 'Marie',
                lastName: 'Dupont',
                email: 'marie.dupont@email.com',
                phone: '06.12.34.56.78',
                adress: '123 Rue de la Paix, Marseille',
                enfants: [
                    { firstName: 'Lucas', lastName: 'Dupont', dateNaissance: new Date('2018-03-15'), niveau: 'CP' },
                    { firstName: 'Emma', lastName: 'Dupont', dateNaissance: new Date('2020-08-22'), niveau: 'MS' }
                ]
            },
            {
                firstName: 'Pierre',
                lastName: 'Martin',
                email: 'pierre.martin@email.com',
                phone: '06.23.45.67.89',
                adress: '456 Avenue des Écoles, Marseille',
                enfants: [
                    { firstName: 'Thomas', lastName: 'Martin', dateNaissance: new Date('2016-11-08'), niveau: 'CE2' }
                ]
            },
            {
                firstName: 'Sophie',
                lastName: 'Bernard',
                email: 'sophie.bernard@email.com',
                phone: '06.34.56.78.90',
                adress: '789 Boulevard Saint-Mathieu, Marseille',
                enfants: [
                    { firstName: 'Léa', lastName: 'Bernard', dateNaissance: new Date('2017-05-12'), niveau: 'CE1' },
                    { firstName: 'Hugo', lastName: 'Bernard', dateNaissance: new Date('2019-09-30'), niveau: 'GS' }
                ]
            }
        ];

        for (const parentData of parentsExemple) {
            const existingParent = await prisma.user.findUnique({
                where: { email: parentData.email }
            });

            if (!existingParent) {
                const hashedPassword = await bcrypt.hash('Parent123!', 10);
                
                const parent = await prisma.user.create({
                    data: {
                        firstName: parentData.firstName,
                        lastName: parentData.lastName,
                        email: parentData.email,
                        password: hashedPassword,
                        phone: parentData.phone,
                        adress: parentData.adress,
                        role: 'PARENT'
                    }
                });

                console.log(`✅ Parent créé: ${parent.firstName} ${parent.lastName}`);

                // Créer les enfants
                for (const enfantData of parentData.enfants) {
                    const classeCorrespondante = createdClasses.find(c => c.niveau === enfantData.niveau);
                    
                    if (classeCorrespondante) {
                        const student = await prisma.student.create({
                            data: {
                                firstName: enfantData.firstName,
                                lastName: enfantData.lastName,
                                dateNaissance: enfantData.dateNaissance,
                                parentId: parent.id,
                                classeId: classeCorrespondante.id
                            }
                        });
                        console.log(`  👶 Élève créé: ${student.firstName} ${student.lastName} (${classeCorrespondante.nom})`);
                    }
                }
            } else {
                console.log(`⚠️  Parent ${parentData.email} existe déjà`);
            }
        }

        // === CONFIGURATION DES INSCRIPTIONS ===
        console.log('\n⚙️ Configuration des inscriptions...');
        
        const existingConfig = await prisma.inscriptionConfig.findFirst();
        
        if (!existingConfig) {
            // Récupérer Lionel pour l'ID
            const lionel = await prisma.user.findUnique({
                where: { email: 'l.camboulives@stmathieu.org' }
            });

            if (lionel) {
                await prisma.inscriptionConfig.create({
                    data: {
                        soustitre: 'Demande d\'inscription pour l\'année scolaire 2025-2026',
                        afficherAnnoncePS2026: true,
                        actif: true,
                        modifiePar: lionel.id
                    }
                });
                console.log('✅ Configuration des inscriptions créée');
            }
        } else {
            console.log('⚠️  Configuration des inscriptions existe déjà');
        }

        // === RÉCAPITULATIF ===
        console.log('\n🎉 RÉCAPITULATIF DE LA CRÉATION:');
        console.log('═══════════════════════════════════════');
        
        const finalStats = await Promise.all([
            prisma.classe.count(),
            prisma.student.count(),
            prisma.user.count({ where: { role: 'PARENT' } }),
            prisma.user.count({ where: { role: 'SECRETAIRE_DIRECTION' } })
        ]);

        console.log(`📚 Classes créées: ${finalStats[0]}`);
        console.log(`👶 Élèves inscrits: ${finalStats[1]}`);
        console.log(`👨‍👩‍👧‍👦 Parents: ${finalStats[2]}`);
        console.log(`👩‍💼 Secrétaires: ${finalStats[3]}`);
        
        console.log('\n📋 COMPTES CRÉÉS:');
        console.log('👩‍💼 YAMINA (SECRÉTAIRE):');
        console.log(`   📧 Email: yamina.secretaire@stmathieu.org`);
        console.log(`   🔑 Mot de passe: Yamina123!`);
        
        console.log('\n👨‍👩‍👧‍👦 PARENTS D\'EXEMPLE:');
        console.log(`   📧 marie.dupont@email.com / Parent123!`);
        console.log(`   📧 pierre.martin@email.com / Parent123!`);
        console.log(`   📧 sophie.bernard@email.com / Parent123!`);

        console.log('\n✅ École prête à fonctionner !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des données:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createBasicSchoolData()
    .then(() => {
        console.log('\n🎯 Script terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur:', error);
        process.exit(1);
    });
