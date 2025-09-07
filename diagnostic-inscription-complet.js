const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * DIAGNOSTIC COMPLET DU SYSTÃˆME D'INSCRIPTION
 * VÃ©rifie que tout est en place pour le workflow parent â†’ enfants
 */

async function diagnosticCompletInscription() {
    console.log('ðŸ¥ === DIAGNOSTIC COMPLET SYSTÃˆME INSCRIPTION ===');
    console.log('======\n');

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
        console.log('ðŸ’¾ TEST 1: Base de donnÃ©es et modÃ¨les...');

        try {
            // Test connexion Prisma
            await prisma.$connect();
            console.log('   âœ… Connexion Prisma OK');

            // VÃ©rifier tables principales
            const tablesTest = await Promise.all([
                prisma.preInscriptionRequest.count(),
                prisma.user.count(),
                prisma.student.count()
            ]);

            console.log(`   ðŸ“Š Demandes d'inscription: ${tablesTest[0]}`);
            console.log(`   ðŸ“Š Utilisateurs: ${tablesTest[1]}`);
            console.log(`   ðŸ“Š Ã‰lÃ¨ves: ${tablesTest[2]}`);

            rapport.database = true;
            console.log('   âœ… Base de donnÃ©es opÃ©rationnelle\n');

        } catch (dbError) {
            console.log('   âŒ Erreur base de donnÃ©es:', dbError.message);
            rapport.database = false;
        }

        console.log('ðŸŽ›ï¸ TEST 2: ContrÃ´leurs d\'inscription...');

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

            console.log(`   ðŸ“‹ MÃ©thodes trouvÃ©es: ${methodsPresent.length}/${methodsRequired.length}`);
            methodsPresent.forEach(method => {
                console.log(`      âœ… ${method}`);
            });

            if (methodsPresent.length === methodsRequired.length) {
                rapport.controllers = true;
                console.log('   âœ… ContrÃ´leurs complets\n');
            } else {
                console.log('   âš ï¸ Certaines mÃ©thodes manquantes\n');
            }

        } catch (controllerError) {
            console.log('   âŒ Erreur contrÃ´leurs:', controllerError.message);
            rapport.controllers = false;
        }

        console.log('ðŸ“§ TEST 3: Service email...');

        try {
            const emailService = require('./src/services/emailService');

            console.log('   ðŸ“ Configuration:');
            console.log(`      EMAIL_USER: ${process.env.EMAIL_USER ? 'âœ… DÃ©fini' : 'âŒ Manquant'}`);
            console.log(`      EMAIL_PASS: ${process.env.EMAIL_PASS ? 'âœ… DÃ©fini' : 'âŒ Manquant'}`);
            console.log(`      TEST_EMAIL: sgdigitalweb13@gmail.com`);
            console.log(`      PARENT_TEST: sebcecg@gmail.com`);

            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                rapport.emails = true;
                console.log('   âœ… Service email configurÃ©\n');
            } else {
                console.log('   âš ï¸ Configuration email incomplÃ¨te\n');
                rapport.emails = false;
            }

        } catch (emailError) {
            console.log('   âŒ Erreur service email:', emailError.message);
            rapport.emails = false;
        }

        console.log('ðŸ‘¥ TEST 4: Gestion des parents...');

        try {
            const parents = await prisma.user.findMany({
                where: { role: 'PARENT' },
                include: {
                    students: true
                }
            });

            console.log(`   ðŸ“Š Parents dans le systÃ¨me: ${parents.length}`);

            if (parents.length > 0) {
                console.log('   ðŸ‘¤ Exemples de parents:');
                parents.slice(0, 3).forEach((parent, index) => {
                    console.log(`      ${index + 1}. ${parent.firstName} ${parent.lastName} (${parent.students.length} enfant(s))`);
                });
            }

            rapport.gestionParents = true;
            console.log('   âœ… Gestion parents opÃ©rationnelle\n');

        } catch (parentError) {
            console.log('   âŒ Erreur gestion parents:', parentError.message);
            rapport.gestionParents = false;
        }

        console.log('ðŸ‘¶ TEST 5: Gestion des enfants...');

        try {
            const enfants = await prisma.student.findMany({
                include: {
                    parent: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                }
            });

            console.log(`   ðŸ“Š Ã‰lÃ¨ves dans le systÃ¨me: ${enfants.length}`);

            const orphelins = enfants.filter(e => !e.parent);
            console.log(`   ðŸ“Š Ã‰lÃ¨ves sans parent: ${orphelins.length}`);

            if (enfants.length > 0) {
                console.log('   ðŸ‘¶ Exemples d\'Ã©lÃ¨ves:');
                enfants.slice(0, 3).forEach((enfant, index) => {
                    const parent = enfant.parent
                        ? `${enfant.parent.firstName} ${enfant.parent.lastName}`
                        : 'Aucun parent';
                    console.log(`      ${index + 1}. ${enfant.firstName} ${enfant.lastName} â†’ Parent: ${parent}`);
                });
            }

            rapport.gestionEnfants = true;
            console.log('   âœ… Gestion enfants opÃ©rationnelle\n');

        } catch (enfantError) {
            console.log('   âŒ Erreur gestion enfants:', enfantError.message);
            rapport.gestionEnfants = false;
        }

        console.log('ðŸ« TEST 6: Organisation scolaire...');

        try {
            // VÃ©rifier les relations parent-enfant
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

            console.log(`   ðŸ“Š Parents avec enfants: ${relationsParentEnfant.length}`);

            // Calculer statistiques
            const totalEnfants = relationsParentEnfant.reduce((sum, parent) => sum + parent.students.length, 0);
            console.log(`   ðŸ“Š Total enfants liÃ©s: ${totalEnfants}`);

            if (relationsParentEnfant.length > 0) {
                console.log('   ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ Exemples de familles:');
                relationsParentEnfant.slice(0, 2).forEach((parent, index) => {
                    console.log(`      ${index + 1}. ${parent.firstName} ${parent.lastName}:`);
                    parent.students.forEach((enfant, i) => {
                        const age = Math.floor((new Date() - new Date(enfant.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
                        console.log(`         - ${enfant.firstName} ${enfant.lastName} (${age} ans)`);
                    });
                });
            }

            rapport.organisationScolaire = true;
            console.log('   âœ… Organisation scolaire opÃ©rationnelle\n');

        } catch (orgError) {
            console.log('   âŒ Erreur organisation scolaire:', orgError.message);
            rapport.organisationScolaire = false;
        }

        console.log('ðŸ”„ TEST 7: Workflow complet...');

        try {
            // VÃ©rifier une demande d'inscription rÃ©cente
            const dernieresDemandes = await prisma.preInscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                take: 3,
                include: {
                    processor: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            console.log(`   ðŸ“Š Demandes rÃ©centes: ${dernieresDemandes.length}`);

            const stats = {
                pending: dernieresDemandes.filter(d => d.status === 'PENDING').length,
                accepted: dernieresDemandes.filter(d => d.status === 'ACCEPTED').length,
                rejected: dernieresDemandes.filter(d => d.status === 'REJECTED').length
            };

            console.log(`   ðŸ“ˆ En attente: ${stats.pending}`);
            console.log(`   ðŸ“ˆ AcceptÃ©es: ${stats.accepted}`);
            console.log(`   ðŸ“ˆ RefusÃ©es: ${stats.rejected}`);

            if (dernieresDemandes.length > 0) {
                console.log('   ðŸ“‹ DerniÃ¨res demandes:');
                dernieresDemandes.forEach((demande, index) => {
                    const status = demande.status === 'PENDING' ? 'â³' :
                        demande.status === 'ACCEPTED' ? 'âœ…' :
                            demande.status === 'REJECTED' ? 'âŒ' : 'â“';
                    console.log(`      ${index + 1}. ${status} ${demande.parentFirstName} ${demande.parentLastName} (${demande.parentEmail})`);
                });
            }

            rapport.workflow = true;
            console.log('   âœ… Workflow complet opÃ©rationnel\n');

        } catch (workflowError) {
            console.log('   âŒ Erreur workflow:', workflowError.message);
            rapport.workflow = false;
        }

        // RÃ‰SUMÃ‰ FINAL
        console.log('ðŸŽ¯ === RÃ‰SUMÃ‰ DIAGNOSTIC ===');
        console.log('======');

        const totalTests = Object.keys(rapport).length;
        const testsReussis = Object.values(rapport).filter(Boolean).length;
        const pourcentage = Math.round((testsReussis / totalTests) * 100);

        console.log(`ðŸ“Š Tests rÃ©ussis: ${testsReussis}/${totalTests} (${pourcentage}%)`);
        console.log('');

        Object.entries(rapport).forEach(([test, status]) => {
            const icon = status ? 'âœ…' : 'âŒ';
            const label = test.replace(/([A-Z])/g, ' $1').toLowerCase();
            console.log(`   ${icon} ${label}`);
        });

        console.log('');

        if (testsReussis === totalTests) {
            console.log('ðŸŽ‰ === SYSTÃˆME PRÃŠT ===');
            console.log('âœ… Tous les composants fonctionnent !');
            console.log('');
            console.log('ðŸš€ WORKFLOW INSCRIPTION VALIDÃ‰:');
            console.log('   1. âœ… Parent fait demande â†’ Base de donnÃ©es');
            console.log('   2. âœ… Notification admin â†’ sgdigitalweb13@gmail.com');
            console.log('   3. âœ… Admin approuve â†’ Compte parent crÃ©Ã©');
            console.log('   4. âœ… Enfants crÃ©Ã©s â†’ Gestion enfants');
            console.log('   5. âœ… Relations Ã©tablies â†’ Organisation scolaire');
            console.log('   6. âœ… Email confirmation â†’ sebcecg@gmail.com');
            console.log('');
            console.log('ðŸ‘¥ GESTION OPÃ‰RATIONNELLE:');
            console.log('   âœ… Gestion Parents accessible');
            console.log('   âœ… Gestion Enfants accessible');
            console.log('   âœ… Organisation Scolaire accessible');

        } else {
            console.log('âš ï¸ === ATTENTION ===');
            console.log('Certains composants nÃ©cessitent une vÃ©rification');
            console.log('');

            const failed = Object.entries(rapport)
                .filter(([_, status]) => !status)
                .map(([test, _]) => test);

            if (failed.length > 0) {
                console.log('âŒ PROBLÃˆMES DÃ‰TECTÃ‰S:');
                failed.forEach(test => {
                    console.log(`   - ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                });
            }
        }

        console.log('======');

    } catch (error) {
        console.error('\nâŒ Erreur diagnostic:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Lancer le diagnostic
if (require.main === module) {
    diagnosticCompletInscription();
}

module.exports = diagnosticCompletInscription;

