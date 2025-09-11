const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompleteInscription() {
    try {
        console.log('🧪 Test complet d\'inscription...');
        
        // 1. Créer une demande de pré-inscription réaliste
        const testRequest = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Marie',
                parentLastName: 'Dupont',
                parentEmail: 'marie.dupont.test@example.com',
                parentPhone: '01.23.45.67.89',
                parentAddress: '15 rue des Écoles, 13000 Marseille',
                parentPassword: 'monmotdepasse123',
                children: JSON.stringify([
                    {
                        firstName: 'Lucas',
                        lastName: 'Dupont',
                        birthDate: '2017-03-15',
                        schoolLevel: 'CE1'
                    },
                    {
                        firstName: 'Emma',
                        lastName: 'Dupont',
                        birthDate: '2019-07-22',
                        schoolLevel: 'PS'
                    }
                ]),
                status: 'PENDING',
                message: 'Nous souhaitons inscrire nos deux enfants dans votre école.',
                specialNeeds: 'Lucas a besoin d\'aide pour les mathématiques.'
            }
        });
        
        console.log('✅ Demande de pré-inscription créée:', testRequest.id);
        
        // 2. Simuler l'approbation par un admin
        const requestId = testRequest.id;
        const comment = 'Dossier complet - Inscription approuvée';
        
        console.log('🔍 Récupération de la demande...');
        const request = await prisma.preInscriptionRequest.findUnique({
            where: { id: requestId }
        });
        
        if (!request || request.status !== 'PENDING') {
            throw new Error('Demande non trouvée ou déjà traitée');
        }
        
        // 3. Vérifier qu'aucun compte parent n'existe
        const existingUser = await prisma.user.findUnique({
            where: { email: request.parentEmail }
        });
        
        if (existingUser) {
            throw new Error('Un compte avec cet email existe déjà');
        }
        
        // 4. Créer le compte parent
        console.log('👨‍👩‍👧‍👦 Création du compte parent...');
        const tempPassword = 'TempEcole' + Math.floor(Math.random() * 1000) + '!';
        const bcrypt = require('bcrypt');
        const hashedTempPassword = await bcrypt.hash(tempPassword, 12);
        
        const parentUser = await prisma.user.create({
            data: {
                firstName: request.parentFirstName,
                lastName: request.parentLastName,
                email: request.parentEmail,
                password: hashedTempPassword,
                role: 'PARENT',
                phone: request.parentPhone,
                adress: request.parentAddress
            }
        });
        
        console.log('✅ Compte parent créé:', parentUser.email, '(ID:', parentUser.id + ')');
        
        // 5. Créer les enfants
        console.log('👶 Création des enfants...');
        let createdStudents = [];
        const childrenData = JSON.parse(request.children);
        
        for (const childData of childrenData) {
            if (childData.firstName && childData.lastName && childData.birthDate) {
                
                // Déterminer la classe selon le niveau scolaire
                let classeId = null;
                if (childData.schoolLevel) {
                    let classe;
                    switch (childData.schoolLevel?.toUpperCase()) {
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
                        console.log(`   📚 ${childData.firstName} ${childData.lastName}: ${childData.schoolLevel} → Classe ${classe.nom} (ID: ${classeId})`);
                    } else {
                        console.log(`   ⚠️ Classe non trouvée pour le niveau ${childData.schoolLevel}`);
                        const firstClasse = await prisma.classe.findFirst();
                        classeId = firstClasse?.id || 1;
                    }
                } else {
                    const firstClasse = await prisma.classe.findFirst();
                    classeId = firstClasse?.id || 1;
                    console.log(`   📚 ${childData.firstName} ${childData.lastName}: Niveau non spécifié → Classe par défaut (ID: ${classeId})`);
                }
                
                const student = await prisma.student.create({
                    data: {
                        firstName: childData.firstName,
                        lastName: childData.lastName,
                        dateNaissance: new Date(childData.birthDate),
                        parentId: parentUser.id,
                        classeId: classeId
                    }
                });

                createdStudents.push(student);
                console.log(`   ✅ Enfant créé: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
            }
        }
        
        // 6. Mettre à jour la demande
        console.log('📝 Mise à jour de la demande...');
        await prisma.preInscriptionRequest.update({
            where: { id: request.id },
            data: {
                status: 'ACCEPTED',
                processedAt: new Date(),
                processedBy: 1, // Admin test
                adminNotes: comment || `Demande approuvée - Compte parent et ${createdStudents.length} enfant(s) créés`
            }
        });
        
        // 7. Vérifier le résultat
        console.log('\n🎉 RÉSULTAT DU TEST:');
        console.log('===================');
        console.log('✅ Parent créé:', parentUser.email);
        console.log('✅ Enfants créés:', createdStudents.length);
        createdStudents.forEach(student => {
            console.log(`   - ${student.firstName} ${student.lastName}`);
        });
        console.log('✅ Mot de passe temporaire:', tempPassword);
        console.log('✅ Demande marquée comme ACCEPTED');
        
        console.log('\n📊 Vérification dans la base:');
        const verifyParent = await prisma.user.findUnique({
            where: { email: parentUser.email },
            include: { enfants: true }
        });
        
        console.log('Parent en base:', verifyParent?.firstName, verifyParent?.lastName);
        console.log('Enfants liés:', verifyParent?.enfants?.length || 0);
        
        console.log('\n✅ TEST RÉUSSI - L\'inscription fonctionne correctement !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testCompleteInscription();
