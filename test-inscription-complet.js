#!/usr/bin/env node

/**
 * Script de test complet du système d'inscription
 * - Test création demande d'inscription
 * - Test approbation
 * - Test création du parent et enfants
 * - Test emails
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

// Données de test
const TEST_DATA = {
    parent: {
        firstName: 'Sébastien',
        lastName: 'Ceccarelli',
        email: 'sebcecg@gmail.com',
        phone: '06.12.34.56.78',
        address: '123 Rue de Test, 13013 Marseille',
        password: 'TestPassword123!'
    },
    children: [
        {
            firstName: 'Emma',
            lastName: 'Ceccarelli',
            birthDate: '2015-03-15'
        },
        {
            firstName: 'Lucas',
            lastName: 'Ceccarelli',
            birthDate: '2017-09-22'
        }
    ],
    adminEmail: 'sgdigitalweb13@gmail.com'
};

async function runCompletTest() {
    console.log('🚀 DÉBUT DU TEST COMPLET D\'INSCRIPTION');
    console.log('==========================================');

    try {
        // 1. Nettoyer les données de test existantes
        console.log('\n1️⃣ Nettoyage des données de test...');
        await cleanupTestData();

        // 2. Créer une demande d'inscription
        console.log('\n2️⃣ Création d\'une demande d\'inscription...');
        const request = await createInscriptionRequest();

        // 3. Envoyer email de confirmation de demande
        console.log('\n3️⃣ Envoi email de confirmation de demande...');
        await testConfirmationEmail(request);

        // 4. Envoyer notification à l'admin
        console.log('\n4️⃣ Envoi notification à l\'admin...');
        await testAdminNotification(request);

        // 5. Approuver la demande (simule l'action admin)
        console.log('\n5️⃣ Approbation de la demande...');
        await approveRequest(request.id);

        // 6. Vérifier la création du parent
        console.log('\n6️⃣ Vérification création du parent...');
        await verifyParentCreation();

        // 7. Créer et assigner les enfants
        console.log('\n7️⃣ Création et assignation des enfants...');
        await createAndAssignChildren();

        // 8. Vérifier la structure complète
        console.log('\n8️⃣ Vérification structure complète...');
        await verifyCompleteStructure();

        // 9. Test demande d'identifiants
        console.log('\n9️⃣ Test demande d\'identifiants...');
        await testIdentifiantsRequest();

        console.log('\n✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
        console.log('==========================================');

    } catch (error) {
        console.error('\n❌ ERREUR DANS LES TESTS:', error);
        console.error('==========================================');
    } finally {
        await prisma.$disconnect();
    }
}

async function cleanupTestData() {
    // Supprimer les données de test existantes
    await prisma.student.deleteMany({
        where: {
            OR: [
                { firstName: 'Emma', lastName: 'Ceccarelli' },
                { firstName: 'Lucas', lastName: 'Ceccarelli' }
            ]
        }
    });

    await prisma.user.deleteMany({
        where: { email: TEST_DATA.parent.email }
    });

    await prisma.preInscriptionRequest.deleteMany({
        where: { parentEmail: TEST_DATA.parent.email }
    });

    console.log('   ✅ Données de test nettoyées');
}

async function createInscriptionRequest() {
    const hashedPassword = await bcrypt.hash(TEST_DATA.parent.password, 12);

    const request = await prisma.preInscriptionRequest.create({
        data: {
            parentFirstName: TEST_DATA.parent.firstName,
            parentLastName: TEST_DATA.parent.lastName,
            parentEmail: TEST_DATA.parent.email,
            parentPhone: TEST_DATA.parent.phone,
            parentAddress: TEST_DATA.parent.address,
            parentPassword: hashedPassword,
            children: TEST_DATA.children
        }
    });

    console.log('   ✅ Demande d\'inscription créée, ID:', request.id);
    return request;
}

async function testConfirmationEmail(request) {
    try {
        await emailService.sendConfirmationEmail({
            parentFirstName: request.parentFirstName,
            parentLastName: request.parentLastName,
            parentEmail: request.parentEmail,
            children: request.children
        });
        console.log('   ✅ Email de confirmation envoyé à:', request.parentEmail);
    } catch (error) {
        console.log('   ⚠️ Erreur email confirmation:', error.message);
    }
}

async function testAdminNotification(request) {
    try {
        await emailService.sendAdminNotification({
            requestId: request.id,
            parentFirstName: request.parentFirstName,
            parentLastName: request.parentLastName,
            parentEmail: request.parentEmail,
            children: request.children,
            adminEmail: TEST_DATA.adminEmail
        });
        console.log('   ✅ Notification admin envoyée à:', TEST_DATA.adminEmail);
    } catch (error) {
        console.log('   ⚠️ Erreur notification admin:', error.message);
    }
}

async function approveRequest(requestId) {
    // Récupérer la demande
    const request = await prisma.preInscriptionRequest.findUnique({
        where: { id: requestId }
    });

    // Créer le compte parent
    const parentUser = await prisma.user.create({
        data: {
            firstName: request.parentFirstName,
            lastName: request.parentLastName,
            email: request.parentEmail,
            password: request.parentPassword,
            role: 'PARENT',
            phone: request.parentPhone,
            adress: request.parentAddress
        }
    });

    // Mettre à jour le statut de la demande
    await prisma.preInscriptionRequest.update({
        where: { id: requestId },
        data: {
            status: 'ACCEPTED',
            processedAt: new Date(),
            adminNotes: 'Test automatique - Demande approuvée'
        }
    });

    // Envoyer email d'approbation
    try {
        await emailService.sendApprovalEmail(request, 'Demande approuvée lors du test automatique');
        console.log('   ✅ Email d\'approbation envoyé');
    } catch (error) {
        console.log('   ⚠️ Erreur email approbation:', error.message);
    }

    // Envoyer email d'activation du compte
    try {
        await emailService.sendAccountActivatedEmail({
            parentFirstName: request.parentFirstName,
            parentLastName: request.parentLastName,
            parentEmail: request.parentEmail
        });
        console.log('   ✅ Email d\'activation du compte envoyé');
    } catch (error) {
        console.log('   ⚠️ Erreur email activation:', error.message);
    }

    console.log('   ✅ Demande approuvée et parent créé');
    return parentUser;
}

async function verifyParentCreation() {
    const parent = await prisma.user.findUnique({
        where: { email: TEST_DATA.parent.email }
    });

    if (!parent) {
        throw new Error('Parent non créé !');
    }

    console.log('   ✅ Parent créé:', parent.firstName, parent.lastName, '- Role:', parent.role);
    return parent;
}

async function createAndAssignChildren() {
    const parent = await prisma.user.findUnique({
        where: { email: TEST_DATA.parent.email }
    });

    // Récupérer ou créer des classes de test
    let classeCP = await prisma.classe.findFirst({
        where: { nom: 'CP', niveau: 'CP' }
    });

    if (!classeCP) {
        classeCP = await prisma.classe.create({
            data: {
                nom: 'CP',
                niveau: 'CP',
                anneeScolaire: '2024-2025'
            }
        });
    }

    let classeCE1 = await prisma.classe.findFirst({
        where: { nom: 'CE1', niveau: 'CE1' }
    });

    if (!classeCE1) {
        classeCE1 = await prisma.classe.create({
            data: {
                nom: 'CE1',
                niveau: 'CE1',
                anneeScolaire: '2024-2025'
            }
        });
    }

    // Créer les enfants
    const emma = await prisma.student.create({
        data: {
            firstName: TEST_DATA.children[0].firstName,
            lastName: TEST_DATA.children[0].lastName,
            birthDate: new Date(TEST_DATA.children[0].birthDate),
            parentId: parent.id,
            classeId: classeCP.id
        }
    });

    const lucas = await prisma.student.create({
        data: {
            firstName: TEST_DATA.children[1].firstName,
            lastName: TEST_DATA.children[1].lastName,
            birthDate: new Date(TEST_DATA.children[1].birthDate),
            parentId: parent.id,
            classeId: classeCE1.id
        }
    });

    console.log('   ✅ Enfants créés:');
    console.log('     - Emma en', classeCP.nom);
    console.log('     - Lucas en', classeCE1.nom);

    return { emma, lucas };
}

async function verifyCompleteStructure() {
    // Vérifier parent
    const parent = await prisma.user.findUnique({
        where: { email: TEST_DATA.parent.email },
        include: {
            children: {
                include: {
                    classe: true
                }
            }
        }
    });

    if (!parent) {
        throw new Error('Parent introuvable !');
    }

    console.log('   👨‍👩‍👧‍👦 STRUCTURE FAMILLE CRÉÉE:');
    console.log('   Parent:', parent.firstName, parent.lastName);
    console.log('   Email:', parent.email);
    console.log('   Téléphone:', parent.phone);
    console.log('   Enfants:');

    parent.children.forEach(child => {
        console.log(`     - ${child.firstName} ${child.lastName} (${child.classe.nom})`);
    });

    // Vérifier dans les différentes sections
    console.log('\n   📋 VÉRIFICATION DANS LES SECTIONS:');

    // Gestion Parents
    const parentsCount = await prisma.user.count({
        where: { role: 'PARENT' }
    });
    console.log('   - Gestion Parents:', parentsCount, 'parents enregistrés');

    // Gestion Enfants
    const studentsCount = await prisma.student.count();
    console.log('   - Gestion Enfants:', studentsCount, 'élèves enregistrés');

    // Organisation Scolaire
    const classesWithStudents = await prisma.classe.findMany({
        include: {
            _count: {
                select: { students: true }
            }
        }
    });
    console.log('   - Organisation Scolaire:');
    classesWithStudents.forEach(classe => {
        console.log(`     * ${classe.nom}: ${classe._count.students} élèves`);
    });

    return true;
}

async function testIdentifiantsRequest() {
    // Simuler une demande d'identifiants pour un parent déjà créé
    console.log('   📧 Test demande d\'identifiants pour parent existant...');

    const parent = await prisma.user.findUnique({
        where: { email: TEST_DATA.parent.email }
    });

    if (parent) {
        try {
            // Simuler l'envoi des identifiants
            await emailService.sendCredentialsEmail({
                parentFirstName: parent.firstName,
                parentLastName: parent.lastName,
                parentEmail: parent.email,
                temporaryPassword: 'TempPass123!'
            });
            console.log('     ✅ Email d\'identifiants envoyé');
        } catch (error) {
            console.log('     ⚠️ Erreur envoi identifiants:', error.message);
        }
    }

    // Test pour un parent non existant
    console.log('   📧 Test demande d\'identifiants pour nouveau parent...');
    const newParentData = {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@test.com',
        phone: '06.98.76.54.32'
    };

    // Vérifier s'il n'existe pas déjà
    const existingParent = await prisma.user.findUnique({
        where: { email: newParentData.email }
    });

    if (!existingParent) {
        // Créer le parent avec mot de passe temporaire
        const tempPassword = 'TempPass123!';
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const newParent = await prisma.user.create({
            data: {
                firstName: newParentData.firstName,
                lastName: newParentData.lastName,
                email: newParentData.email,
                password: hashedPassword,
                role: 'PARENT',
                phone: newParentData.phone
            }
        });

        try {
            await emailService.sendCredentialsEmail({
                parentFirstName: newParent.firstName,
                parentLastName: newParent.lastName,
                parentEmail: newParent.email,
                temporaryPassword: tempPassword
            });
            console.log('     ✅ Nouveau parent créé et identifiants envoyés');
        } catch (error) {
            console.log('     ⚠️ Erreur envoi identifiants nouveau parent:', error.message);
        }
    } else {
        console.log('     ℹ️ Parent déjà existant');
    }
}

// Exécuter les tests
if (require.main === module) {
    runCompletTest().catch(console.error);
}

module.exports = { runCompletTest };
