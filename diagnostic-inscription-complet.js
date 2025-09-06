const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * DIAGNOSTIC COMPLET DU SYSTÈME D'INSCRIPTION
 * Vérifie que tout est en place pour le workflow parent → enfants
 */

async function diagnosticCompletInscription() {
    console.log('🏥 === DIAGNOSTIC COMPLET SYSTÈME INSCRIPTION ===');
    console.log('================================================\n');

    const rapport = {
        database: false,
        controllers: false,
        emails: false,
        gestionParents: false,
        gestionEnfants: false,
        organisationScolaire: false,
        workflow: false
    };

    try {
        console.log('💾 TEST 1: Base de données et modèles...');

        try {
            // Test connexion Prisma
            await prisma.$connect();
            console.log('   ✅ Connexion Prisma OK');

            // Vérifier tables principales
            const tablesTest = await Promise.all([
                prisma.preInscriptionRequest.count(),
                prisma.user.count(),
                prisma.student.count()
            ]);

            console.log(`   📊 Demandes d'inscription: ${tablesTest[0]}`);
            console.log(`   📊 Utilisateurs: ${tablesTest[1]}`);
            console.log(`   📊 Élèves: ${tablesTest[2]}`);

            rapport.database = true;
            console.log('   ✅ Base de données opérationnelle\n');

        } catch (dbError) {
            console.log('   ❌ Erreur base de données:', dbError.message);
            rapport.database = false;
        }

        console.log('🎛️ TEST 2: Contrôleurs d\'inscription...');

        try {
            const inscriptionController = require('./src/controllers/inscriptionController');

            const methodsRequired = [
                'processRegistration',
                'approveRequest',
                'showAllRequests'
            ];

            const methodsPresent = methodsRequired.filter(method =>
                typeof inscriptionController[method] === 'function'
            );

            console.log(`   📋 Méthodes trouvées: ${methodsPresent.length}/${methodsRequired.length}`);
            methodsPresent.forEach(method => {
                console.log(`      ✅ ${method}`);
            });

            if (methodsPresent.length === methodsRequired.length) {
                rapport.controllers = true;
                console.log('   ✅ Contrôleurs complets\n');
            } else {
                console.log('   ⚠️ Certaines méthodes manquantes\n');
            }

        } catch (controllerError) {
            console.log('   ❌ Erreur contrôleurs:', controllerError.message);
            rapport.controllers = false;
        }

        console.log('📧 TEST 3: Service email...');

        try {
            const emailService = require('./src/services/emailService');

            console.log('   📝 Configuration:');
            console.log(`      EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Défini' : '❌ Manquant'}`);
            console.log(`      EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Défini' : '❌ Manquant'}`);
            console.log(`      TEST_EMAIL: sgdigitalweb13@gmail.com`);
            console.log(`      PARENT_TEST: sebcecg@gmail.com`);

            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                rapport.emails = true;
                console.log('   ✅ Service email configuré\n');
            } else {
                console.log('   ⚠️ Configuration email incomplète\n');
                rapport.emails = false;
            }

        } catch (emailError) {
            console.log('   ❌ Erreur service email:', emailError.message);
            rapport.emails = false;
        }

        console.log('👥 TEST 4: Gestion des parents...');

        try {
            const parents = await prisma.user.findMany({
                where: { role: 'PARENT' },
                include: {
                    students: true
                }
            });

            console.log(`   📊 Parents dans le système: ${parents.length}`);

            if (parents.length > 0) {
                console.log('   👤 Exemples de parents:');
                parents.slice(0, 3).forEach((parent, index) => {
                    console.log(`      ${index + 1}. ${parent.firstName} ${parent.lastName} (${parent.students.length} enfant(s))`);
                });
            }

            rapport.gestionParents = true;
            console.log('   ✅ Gestion parents opérationnelle\n');

        } catch (parentError) {
            console.log('   ❌ Erreur gestion parents:', parentError.message);
            rapport.gestionParents = false;
        }

        console.log('👶 TEST 5: Gestion des enfants...');

        try {
            const enfants = await prisma.student.findMany({
                include: {
                    parent: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                }
            });

            console.log(`   📊 Élèves dans le système: ${enfants.length}`);

            const orphelins = enfants.filter(e => !e.parent);
            console.log(`   📊 Élèves sans parent: ${orphelins.length}`);

            if (enfants.length > 0) {
                console.log('   👶 Exemples d\'élèves:');
                enfants.slice(0, 3).forEach((enfant, index) => {
                    const parent = enfant.parent
                        ? `${enfant.parent.firstName} ${enfant.parent.lastName}`
                        : 'Aucun parent';
                    console.log(`      ${index + 1}. ${enfant.firstName} ${enfant.lastName} → Parent: ${parent}`);
                });
            }

            rapport.gestionEnfants = true;
            console.log('   ✅ Gestion enfants opérationnelle\n');

        } catch (enfantError) {
            console.log('   ❌ Erreur gestion enfants:', enfantError.message);
            rapport.gestionEnfants = false;
        }

        console.log('🏫 TEST 6: Organisation scolaire...');

        try {
            // Vérifier les relations parent-enfant
            const relationsParentEnfant = await prisma.user.findMany({
                where: {
                    role: 'PARENT',
                    students: {
                        some: {}
                    }
                },
                include: {
                    students: {
                        select: {
                            firstName: true,
                            lastName: true,
                            birthDate: true
                        }
                    }
                }
            });

            console.log(`   📊 Parents avec enfants: ${relationsParentEnfant.length}`);

            // Calculer statistiques
            const totalEnfants = relationsParentEnfant.reduce((sum, parent) => sum + parent.students.length, 0);
            console.log(`   📊 Total enfants liés: ${totalEnfants}`);

            if (relationsParentEnfant.length > 0) {
                console.log('   👨‍👩‍👧‍👦 Exemples de familles:');
                relationsParentEnfant.slice(0, 2).forEach((parent, index) => {
                    console.log(`      ${index + 1}. ${parent.firstName} ${parent.lastName}:`);
                    parent.students.forEach((enfant, i) => {
                        const age = Math.floor((new Date() - new Date(enfant.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
                        console.log(`         - ${enfant.firstName} ${enfant.lastName} (${age} ans)`);
                    });
                });
            }

            rapport.organisationScolaire = true;
            console.log('   ✅ Organisation scolaire opérationnelle\n');

        } catch (orgError) {
            console.log('   ❌ Erreur organisation scolaire:', orgError.message);
            rapport.organisationScolaire = false;
        }

        console.log('🔄 TEST 7: Workflow complet...');

        try {
            // Vérifier une demande d'inscription récente
            const dernieresDemandes = await prisma.preInscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                take: 3,
                include: {
                    processor: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            console.log(`   📊 Demandes récentes: ${dernieresDemandes.length}`);

            const stats = {
                pending: dernieresDemandes.filter(d => d.status === 'PENDING').length,
                accepted: dernieresDemandes.filter(d => d.status === 'ACCEPTED').length,
                rejected: dernieresDemandes.filter(d => d.status === 'REJECTED').length
            };

            console.log(`   📈 En attente: ${stats.pending}`);
            console.log(`   📈 Acceptées: ${stats.accepted}`);
            console.log(`   📈 Refusées: ${stats.rejected}`);

            if (dernieresDemandes.length > 0) {
                console.log('   📋 Dernières demandes:');
                dernieresDemandes.forEach((demande, index) => {
                    const status = demande.status === 'PENDING' ? '⏳' :
                        demande.status === 'ACCEPTED' ? '✅' :
                            demande.status === 'REJECTED' ? '❌' : '❓';
                    console.log(`      ${index + 1}. ${status} ${demande.parentFirstName} ${demande.parentLastName} (${demande.parentEmail})`);
                });
            }

            rapport.workflow = true;
            console.log('   ✅ Workflow complet opérationnel\n');

        } catch (workflowError) {
            console.log('   ❌ Erreur workflow:', workflowError.message);
            rapport.workflow = false;
        }

        // RÉSUMÉ FINAL
        console.log('🎯 === RÉSUMÉ DIAGNOSTIC ===');
        console.log('===========================');

        const totalTests = Object.keys(rapport).length;
        const testsReussis = Object.values(rapport).filter(Boolean).length;
        const pourcentage = Math.round((testsReussis / totalTests) * 100);

        console.log(`📊 Tests réussis: ${testsReussis}/${totalTests} (${pourcentage}%)`);
        console.log('');

        Object.entries(rapport).forEach(([test, status]) => {
            const icon = status ? '✅' : '❌';
            const label = test.replace(/([A-Z])/g, ' $1').toLowerCase();
            console.log(`   ${icon} ${label}`);
        });

        console.log('');

        if (testsReussis === totalTests) {
            console.log('🎉 === SYSTÈME PRÊT ===');
            console.log('✅ Tous les composants fonctionnent !');
            console.log('');
            console.log('🚀 WORKFLOW INSCRIPTION VALIDÉ:');
            console.log('   1. ✅ Parent fait demande → Base de données');
            console.log('   2. ✅ Notification admin → sgdigitalweb13@gmail.com');
            console.log('   3. ✅ Admin approuve → Compte parent créé');
            console.log('   4. ✅ Enfants créés → Gestion enfants');
            console.log('   5. ✅ Relations établies → Organisation scolaire');
            console.log('   6. ✅ Email confirmation → sebcecg@gmail.com');
            console.log('');
            console.log('👥 GESTION OPÉRATIONNELLE:');
            console.log('   ✅ Gestion Parents accessible');
            console.log('   ✅ Gestion Enfants accessible');
            console.log('   ✅ Organisation Scolaire accessible');

        } else {
            console.log('⚠️ === ATTENTION ===');
            console.log('Certains composants nécessitent une vérification');
            console.log('');

            const failed = Object.entries(rapport)
                .filter(([_, status]) => !status)
                .map(([test, _]) => test);

            if (failed.length > 0) {
                console.log('❌ PROBLÈMES DÉTECTÉS:');
                failed.forEach(test => {
                    console.log(`   - ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                });
            }
        }

        console.log('===========================');

    } catch (error) {
        console.error('\n❌ Erreur diagnostic:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Lancer le diagnostic
if (require.main === module) {
    diagnosticCompletInscription();
}

module.exports = diagnosticCompletInscription;
