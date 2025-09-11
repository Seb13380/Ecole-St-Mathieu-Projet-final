const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testApproval() {
    try {
        console.log('🧪 Test d\'approbation de la demande ID: 9...');

        // Récupérer la demande
        const request = await prisma.preInscriptionRequest.findUnique({
            where: { id: 9 }
        });

        if (!request) {
            console.log('❌ Demande non trouvée');
            return;
        }

        console.log('📋 Demande trouvée:', {
            id: request.id,
            parentEmail: request.parentEmail,
            status: request.status
        });

        if (request.status !== 'PENDING') {
            console.log('❌ Demande déjà traitée');
            return;
        }

        const children = JSON.parse(request.children);
        console.log('👶 Enfants à créer:', children);

        // Générer un mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        console.log('🔐 Mot de passe temporaire généré:', tempPassword);

        // Créer le parent
        console.log('👨‍👩‍👧‍👦 Création du parent...');
        const newParent = await prisma.user.create({
            data: {
                firstName: request.parentFirstName,
                lastName: request.parentLastName,
                email: request.parentEmail,
                phone: request.parentPhone,
                adress: request.parentAddress || '',
                password: hashedPassword,
                role: 'PARENT'
            }
        });
        console.log('✅ Parent créé avec ID:', newParent.id);

        // Créer les enfants
        console.log('👶 Création des enfants...');
        const createdStudents = [];

        for (const child of children) {
            console.log(`👶 Création de ${child.firstName} ${child.lastName}...`);

            // Déterminer la classe selon le niveau - utiliser les vraies classes
            let classeId = 10; // CP par défaut

            // Récupérer la classe correspondante dynamiquement
            let classe;
            switch (child.schoolLevel?.toUpperCase()) {
                case 'PS': case 'PETITE SECTION':
                    classe = await prisma.classe.findFirst({ where: { nom: 'PS' } });
                    break;
                case 'MS': case 'MOYENNE SECTION':
                    classe = await prisma.classe.findFirst({ where: { nom: 'MS' } });
                    break;
                case 'GS': case 'GRANDE SECTION':
                    classe = await prisma.classe.findFirst({ where: { nom: 'GS' } });
                    break;
                case 'CP': case 'COURS PRÉPARATOIRE':
                    classe = await prisma.classe.findFirst({ where: { nom: 'CP' } });
                    break;
                case 'CE1': case 'COURS ÉLÉMENTAIRE 1':
                    classe = await prisma.classe.findFirst({ where: { nom: 'CE1' } });
                    break;
                case 'CE2': case 'COURS ÉLÉMENTAIRE 2':
                    classe = await prisma.classe.findFirst({ where: { nom: 'CE2' } });
                    break;
                case 'CM1': case 'COURS MOYEN 1':
                    classe = await prisma.classe.findFirst({ where: { nom: 'CM1' } });
                    break;
                case 'CM2': case 'COURS MOYEN 2':
                    classe = await prisma.classe.findFirst({ where: { nom: 'CM2' } });
                    break;
                default:
                    classe = await prisma.classe.findFirst({ where: { nom: 'CP' } });
            }

            if (classe) {
                classeId = classe.id;
            }

            console.log(`📚 Niveau: ${child.schoolLevel} → Classe: ${classe?.nom} (ID: ${classeId})`);

            const student = await prisma.student.create({
                data: {
                    firstName: child.firstName,
                    lastName: child.lastName,
                    dateNaissance: new Date(child.birthDate),
                    parentId: newParent.id,
                    classeId: classeId
                }
            });

            createdStudents.push(student);
            console.log(`✅ Élève créé: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
        }

        // Mettre à jour la demande
        console.log('📝 Mise à jour de la demande...');
        await prisma.preInscriptionRequest.update({
            where: { id: request.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                processedBy: 1, // Admin pour le test
                adminNotes: `Test - Compte parent et ${createdStudents.length} enfant(s) créés`
            }
        });

        console.log('🎉 Approbation réussie !');
        console.log(`👨‍👩‍👧‍👦 Parent créé: ${newParent.email}`);
        console.log(`👶 ${createdStudents.length} enfant(s) créé(s)`);
        console.log(`🔐 Mot de passe temporaire: ${tempPassword}`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'approbation:', error);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testApproval();
