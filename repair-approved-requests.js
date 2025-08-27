const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function repairApprovedRequests() {
    try {
        console.log('🔧 RÉPARATION DES DEMANDES APPROUVÉES');
        console.log('====================================\n');

        // Récupérer les demandes approuvées sans compte parent créé
        const approvedRequests = await prisma.inscriptionRequest.findMany({
            where: { status: 'APPROVED' }
        });

        console.log(`📝 ${approvedRequests.length} demandes approuvées trouvées\n`);

        for (const request of approvedRequests) {
            console.log(`🔄 Traitement: ${request.parentFirstName} ${request.parentLastName}`);

            // Vérifier si le compte parent existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: request.parentEmail }
            });

            if (existingUser) {
                console.log('   ✅ Compte parent existe déjà');

                // Vérifier si les enfants existent
                const existingStudents = await prisma.student.findMany({
                    where: { parentId: existingUser.id }
                });

                if (existingStudents.length > 0) {
                    console.log(`   ✅ ${existingStudents.length} enfant(s) existe(nt) déjà`);
                    continue;
                } else {
                    console.log('   ⚠️  Compte parent existe mais pas d\'enfants - création des enfants...');

                    // Créer les enfants manquants
                    await createMissingChildren(request, existingUser.id);
                }
            } else {
                console.log('   ❌ Aucun compte parent - création complète...');

                // Créer le compte parent et les enfants
                await createCompleteAccount(request);
            }

            console.log('');
        }

        console.log('✅ Réparation terminée !');
        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

async function createMissingChildren(request, parentId) {
    try {
        // Vérifier classe par défaut
        let defaultClasse = await prisma.classe.findFirst({
            where: { nom: 'Non assigné' }
        });

        if (!defaultClasse) {
            defaultClasse = await prisma.classe.create({
                data: {
                    nom: 'Non assigné',
                    niveau: 'En attente',
                    anneeScolaire: new Date().getFullYear().toString()
                }
            });
        }

        // Parser les enfants
        let childrenData = request.children;
        if (typeof request.children === 'string') {
            childrenData = JSON.parse(request.children);
        }

        for (const child of childrenData) {
            const student = await prisma.student.create({
                data: {
                    firstName: child.firstName,
                    lastName: child.lastName,
                    dateNaissance: new Date(child.birthDate),
                    parentId: parentId,
                    classeId: defaultClasse.id
                }
            });
            console.log(`     ✅ Enfant créé: ${student.firstName} ${student.lastName}`);
        }
    } catch (error) {
        console.error('     ❌ Erreur création enfants:', error.message);
    }
}

async function createCompleteAccount(request) {
    try {
        // Générer mot de passe
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Créer le parent
        const parentUser = await prisma.user.create({
            data: {
                firstName: request.parentFirstName,
                lastName: request.parentLastName,
                email: request.parentEmail,
                phone: request.parentPhone,
                adress: request.parentAddress,
                password: hashedPassword,
                role: 'PARENT'
            }
        });

        console.log(`     ✅ Parent créé: ${parentUser.email} (mot de passe: ${tempPassword})`);

        // Créer les enfants
        await createMissingChildren(request, parentUser.id);

    } catch (error) {
        console.error('     ❌ Erreur création compte:', error.message);
    }
}

repairApprovedRequests();
