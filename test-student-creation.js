const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function testStudentCreation() {
    try {
        console.log('🧪 Test de création d\'élève...');

        // D'abord, obtenir un parent et une classe pour le test
        const parent = await prisma.user.findFirst({
            where: { role: 'PARENT' }
        });

        const classe = await prisma.classe.findFirst();

        if (!parent) {
            console.log('❌ Aucun parent trouvé pour le test');
            return;
        }

        console.log('✅ Parent trouvé:', parent.email);
        console.log('✅ Classe trouvée:', classe ? classe.nom : 'Aucune classe');

        // Données de test
        const studentData = {
            firstName: 'Test',
            lastName: 'Élève',
            birthDate: '2015-09-01',
            parentId: parent.id,
            classeId: classe ? classe.id : null
        };

        // Test de l'endpoint directement
        const response = await axios.post('http://localhost:3007/user-management/students',
            studentData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Réponse:', response.data);

        // Vérifier que l'élève a été créé
        const createdStudent = await prisma.student.findFirst({
            where: {
                firstName: 'Test',
                lastName: 'Élève'
            }
        });

        if (createdStudent) {
            console.log('✅ Élève créé avec succès:', createdStudent);

            // Nettoyage - supprimer l'élève de test
            await prisma.student.delete({
                where: { id: createdStudent.id }
            });
            console.log('🧹 Élève de test supprimé');
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testStudentCreation();
