const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugStudentCreation() {
    console.log('🔍 Debug de la création d\'élève - données spécifiques...');

    try {
        // Testons avec les vraies données du formulaire
        const studentData = {
            email: 'test.eleve@stmathieu.org', // Email test
            firstName: 'Test',
            lastName: 'Élève',
            dateNaissance: '2020-09-15', // Date adaptée pour PS
            parentId: 2, // ID du parent Seb
            classeId: 'PS'
        };

        console.log('📋 Données de test:', studentData);

        // Vérification que le parent existe
        const parent = await prisma.user.findUnique({
            where: { id: studentData.parentId }
        });
        console.log('👨‍👩‍👧‍👦 Parent trouvé:', parent ? `${parent.firstName} ${parent.lastName} (${parent.email})` : 'NON TROUVÉ');

        // Vérification que la classe existe
        const classe = await prisma.classe.findUnique({
            where: { id: studentData.classeId }
        });
        console.log('🏫 Classe trouvée:', classe ? `${classe.nom} (${classe.id})` : 'NON TROUVÉE');

        // Vérification que l'email n'existe pas déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: studentData.email }
        });
        console.log('📧 Email existant:', existingUser ? 'OUI - CONFLIT!' : 'NON - OK');

        if (!parent) {
            console.log('❌ Parent introuvable avec ID:', studentData.parentId);
            return;
        }

        if (!classe) {
            console.log('❌ Classe introuvable avec ID:', studentData.classeId);
            return;
        }

        if (existingUser) {
            console.log('❌ Email déjà utilisé');
            return;
        }

        // Génération du mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        console.log('🔐 Mot de passe temporaire généré:', tempPassword);

        // Test de création de l'élève
        console.log('🚀 Tentative de création de l\'élève...');

        const newStudent = await prisma.user.create({
            data: {
                email: studentData.email,
                password: hashedPassword,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                role: 'ELEVE',
                dateNaissance: new Date(studentData.dateNaissance),
                parent: {
                    connect: { id: studentData.parentId }
                },
                classe: {
                    connect: { id: studentData.classeId }
                }
            },
            include: {
                parent: true,
                classe: true
            }
        });

        console.log('✅ Élève créé avec succès!');
        console.log('📊 Détails:', {
            id: newStudent.id,
            email: newStudent.email,
            nom: `${newStudent.firstName} ${newStudent.lastName}`,
            parent: newStudent.parent ? `${newStudent.parent.firstName} ${newStudent.parent.lastName}` : null,
            classe: newStudent.classe ? newStudent.classe.nom : null,
            motDePasse: tempPassword
        });

        // Nettoyage - supprimer l'élève de test
        console.log('🧹 Suppression de l\'élève de test...');
        await prisma.user.delete({
            where: { id: newStudent.id }
        });
        console.log('✅ Élève de test supprimé');

    } catch (error) {
        console.error('❌ Erreur lors du debug:', error.message);
        console.error('📝 Stack trace:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

debugStudentCreation();
