const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudents() {
    try {
        console.log('🔄 Vérification des étudiants dans la base...\n');

        // Compter les étudiants
        const studentCount = await prisma.student.count();
        console.log('👨‍🎓 Nombre total d\'étudiants:', studentCount);

        // Lister les étudiants
        const students = await prisma.student.findMany({
            include: {
                parent: {
                    select: { firstName: true, lastName: true, email: true }
                },
                classe: {
                    select: { nom: true, niveau: true }
                }
            }
        });

        if (students.length > 0) {
            console.log('\n📋 Liste des étudiants:');
            students.forEach((student, index) => {
                console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
                console.log(`   Parent: ${student.parent?.firstName} ${student.parent?.lastName} (${student.parent?.email})`);
                console.log(`   Classe: ${student.classe?.nom} (${student.classe?.niveau})`);
                console.log('');
            });
        } else {
            console.log('\n❌ Aucun étudiant trouvé dans la base de données');
            console.log('💡 Les étudiants sont créés automatiquement quand une demande d\'inscription est approuvée');
        }

        // Vérifier les demandes approuvées
        const approvedRequests = await prisma.inscriptionRequest.findMany({
            where: { status: 'APPROVED' }
        });

        console.log(`📝 Demandes approuvées: ${approvedRequests.length}`);

        if (approvedRequests.length > 0 && students.length === 0) {
            console.log('⚠️  PROBLÈME: Il y a des demandes approuvées mais aucun étudiant créé !');
            console.log('   → Vérifier la fonction createParentAccount() dans inscriptionController');
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkStudents();
