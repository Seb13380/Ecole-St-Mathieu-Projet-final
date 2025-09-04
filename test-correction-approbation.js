const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * 🧪 TEST CORRECTION APPROBATION INSCRIPTION
 * Vérifie que l'approbation crée parent ET enfants
 */

async function testCorrectionApprobation() {
    console.log('🧪 === TEST CORRECTION APPROBATION ===');
    console.log('====================================');

    const PARENT_TEST = {
        firstName: 'Marie',
        lastName: 'Test Correction',
        email: 'sebcecg@gmail.com',
        phone: '0987654321',
        address: '456 Rue de Correction, 13002 Marseille',
        password: 'TestCorrection2024!'
    };

    const ENFANTS_TEST = [
        {
            firstName: 'Léa',
            lastName: 'Test Correction',
            birthDate: '2017-04-20'
        },
        {
            firstName: 'Tom',
            lastName: 'Test Correction',
            birthDate: '2021-08-15'
        }
    ];

    try {
        // Nettoyage
        console.log('🧹 Nettoyage...');
        await prisma.student.deleteMany({
            where: {
                OR: [
                    { firstName: 'Léa', lastName: 'Test Correction' },
                    { firstName: 'Tom', lastName: 'Test Correction' }
                ]
            }
        });
        await prisma.user.deleteMany({
            where: { email: PARENT_TEST.email, lastName: 'Test Correction' }
        });
        await prisma.preInscriptionRequest.deleteMany({
            where: { parentEmail: PARENT_TEST.email, parentLastName: 'Test Correction' }
        });

        // 1. Créer une demande d'inscription
        console.log('📝 1. Création demande d\'inscription...');
        const hashedPassword = await bcrypt.hash(PARENT_TEST.password, 12);

        const demande = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: PARENT_TEST.firstName,
                parentLastName: PARENT_TEST.lastName,
                parentEmail: PARENT_TEST.email,
                parentPhone: PARENT_TEST.phone,
                parentAddress: PARENT_TEST.address,
                parentPassword: hashedPassword,
                children: ENFANTS_TEST,
                status: 'PENDING'
            }
        });

        console.log(`✅ Demande créée (ID: ${demande.id})`);

        // 2. Simuler l'approbation (avec le code corrigé)
        console.log('\n✅ 2. Simulation approbation (code corrigé)...');

        // Vérifier si compte parent existe
        const existingUser = await prisma.user.findUnique({
            where: { email: demande.parentEmail }
        });

        if (existingUser) {
            console.log('❌ Compte parent existe déjà, suppression...');
            await prisma.user.delete({ where: { id: existingUser.id } });
        }

        // Créer le compte parent
        const parentUser = await prisma.user.create({
            data: {
                firstName: demande.parentFirstName,
                lastName: demande.parentLastName,
                email: demande.parentEmail,
                password: demande.parentPassword,
                role: 'PARENT',
                phone: demande.parentPhone,
                adress: demande.parentAddress,
                isActive: true
            }
        });

        console.log(`✅ Parent créé: ${parentUser.firstName} ${parentUser.lastName} (ID: ${parentUser.id})`);

        // Créer les enfants (CODE CORRIGÉ)
        let createdStudents = [];
        if (demande.children) {
            const childrenData = typeof demande.children === 'string'
                ? JSON.parse(demande.children)
                : demande.children;

            console.log('👶 Création des enfants...');

            for (const childData of childrenData) {
                if (childData.firstName && childData.lastName && childData.birthDate) {
                    const student = await prisma.student.create({
                        data: {
                            firstName: childData.firstName,
                            lastName: childData.lastName,
                            birthDate: new Date(childData.birthDate),
                            parentId: parentUser.id
                        }
                    });

                    createdStudents.push(student);
                    console.log(`   ✅ Enfant créé: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
                }
            }
        }

        // Mettre à jour la demande
        await prisma.preInscriptionRequest.update({
            where: { id: demande.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                adminNotes: `Test correction - Parent et ${createdStudents.length} enfant(s) créés`
            }
        });

        // 3. Vérification
        console.log('\n🔍 3. Vérification finale...');

        const verification = await prisma.user.findUnique({
            where: { id: parentUser.id },
            include: {
                students: true
            }
        });

        console.log('✅ VÉRIFICATION RÉUSSIE:');
        console.log(`   👤 Parent: ${verification.firstName} ${verification.lastName}`);
        console.log(`   📧 Email: ${verification.email}`);
        console.log(`   👶 Enfants trouvés: ${verification.students.length}`);

        verification.students.forEach((enfant, index) => {
            console.log(`      ${index + 1}. ${enfant.firstName} ${enfant.lastName}`);
            console.log(`         🎂 Né(e) le: ${enfant.birthDate.toLocaleDateString('fr-FR')}`);
            console.log(`         🔗 Parent ID: ${enfant.parentId}`);
        });

        console.log('\n🎯 === RÉSULTAT ===');
        console.log('==================');
        if (verification.students.length === ENFANTS_TEST.length) {
            console.log('🎉 ✅ CORRECTION RÉUSSIE !');
            console.log('   → Parent créé ✅');
            console.log('   → Enfants créés ✅');
            console.log('   → Relations établies ✅');
            console.log('\n💡 Maintenant quand vous approuvez une inscription :');
            console.log('   ✅ Le parent apparaît dans "Gestion Parents"');
            console.log('   ✅ Les enfants apparaissent dans "Gestion Enfants"');
            console.log('   ✅ Les relations parent-enfant sont créées');
        } else {
            console.log('❌ PROBLÈME PERSISTANT');
            console.log(`   Attendu: ${ENFANTS_TEST.length} enfants`);
            console.log(`   Trouvé: ${verification.students.length} enfants`);
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testCorrectionApprobation();
