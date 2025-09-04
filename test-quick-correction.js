const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testQuick() {
    try {
        console.log('🧪 Test rapide correction approbation...');

        // Nettoyage
        await prisma.student.deleteMany({
            where: { lastName: 'TestCorrection' }
        });
        await prisma.user.deleteMany({
            where: { email: 'test.correction@example.com' }
        });
        await prisma.preInscriptionRequest.deleteMany({
            where: { parentEmail: 'test.correction@example.com' }
        });

        // Créer demande
        const hashedPassword = await bcrypt.hash('Password123!', 12);
        const demande = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Jean',
                parentLastName: 'TestCorrection',
                parentEmail: 'test.correction@example.com',
                parentPassword: hashedPassword,
                children: [
                    { firstName: 'Alice', lastName: 'TestCorrection', birthDate: '2018-05-15' },
                    { firstName: 'Bob', lastName: 'TestCorrection', birthDate: '2020-11-22' }
                ],
                status: 'PENDING'
            }
        });

        console.log('✅ Demande créée');

        // Simuler approbation avec NOUVEAU CODE
        const parentUser = await prisma.user.create({
            data: {
                firstName: demande.parentFirstName,
                lastName: demande.parentLastName,
                email: demande.parentEmail,
                password: demande.parentPassword,
                role: 'PARENT',
                isActive: true
            }
        });

        console.log('✅ Parent créé');

        // NOUVEAU: Créer les enfants
        if (demande.children) {
            const childrenData = typeof demande.children === 'string'
                ? JSON.parse(demande.children)
                : demande.children;

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
                    console.log(`✅ Enfant créé: ${student.firstName}`);
                }
            }
        }

        // Vérification finale
        const verification = await prisma.user.findUnique({
            where: { id: parentUser.id },
            include: { students: true }
        });

        console.log('\n🎯 RÉSULTAT:');
        console.log(`Parent: ${verification.firstName} ${verification.lastName}`);
        console.log(`Enfants: ${verification.students.length}`);
        verification.students.forEach(e => {
            console.log(`  - ${e.firstName} ${e.lastName}`);
        });

        if (verification.students.length === 2) {
            console.log('\n🎉 ✅ CORRECTION RÉUSSIE !');
            console.log('Les enfants sont maintenant créés lors de l\'approbation !');
        } else {
            console.log('\n❌ Problème persistant');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testQuick();
