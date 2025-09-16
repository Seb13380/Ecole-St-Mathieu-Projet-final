const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUndefinedRequestedClass() {
    console.log('🔧 CORRECTION DU PROBLÈME REQUESTEDCLASS UNDEFINED\n');

    try {
        // 1. Identifier les demandes avec des problèmes de requestedClass
        console.log('🔍 Recherche des demandes avec requestedClass undefined...');
        
        const allRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                OR: [
                    { status: 'PENDING' },
                    { status: 'EMAIL_PENDING' }
                ]
            },
            orderBy: { submittedAt: 'desc' }
        });

        console.log(`📋 ${allRequests.length} demande(s) trouvée(s)`);

        let problematicRequests = [];

        for (const request of allRequests) {
            try {
                if (request.children) {
                    const children = JSON.parse(request.children);
                    const hasUndefinedClass = children.some(child => 
                        !child.requestedClass || child.requestedClass === 'undefined' || child.requestedClass === ''
                    );
                    
                    if (hasUndefinedClass) {
                        problematicRequests.push({
                            id: request.id,
                            parentEmail: request.parentEmail,
                            children: children
                        });
                    }
                }
            } catch (e) {
                console.log(`❌ Erreur parsing pour la demande ${request.id}:`, e.message);
                problematicRequests.push({
                    id: request.id,
                    parentEmail: request.parentEmail,
                    children: 'PARSING_ERROR'
                });
            }
        }

        console.log(`\n⚠️  ${problematicRequests.length} demande(s) avec requestedClass problématique:`);
        
        if (problematicRequests.length > 0) {
            console.table(problematicRequests.map(req => ({
                ID: req.id,
                Email: req.parentEmail,
                Problème: req.children === 'PARSING_ERROR' ? 'JSON invalide' : 'requestedClass undefined'
            })));

            // 2. Proposer des corrections automatiques
            console.log('\n🔧 Application des corrections...');
            
            for (const problemRequest of problematicRequests) {
                if (problemRequest.children !== 'PARSING_ERROR') {
                    const correctedChildren = problemRequest.children.map(child => {
                        if (!child.requestedClass || child.requestedClass === 'undefined' || child.requestedClass === '') {
                            // Assigner une classe basée sur l'âge approximatif
                            const birthYear = child.birthDate ? new Date(child.birthDate).getFullYear() : null;
                            const currentYear = new Date().getFullYear();
                            const age = birthYear ? currentYear - birthYear : null;
                            
                            let defaultClass = 'CP'; // Classe par défaut
                            
                            if (age) {
                                if (age <= 3) defaultClass = 'TPS';
                                else if (age === 4) defaultClass = 'PS';
                                else if (age === 5) defaultClass = 'MS';
                                else if (age === 6) defaultClass = 'GS';
                                else if (age === 7) defaultClass = 'CP';
                                else if (age === 8) defaultClass = 'CE1';
                                else if (age === 9) defaultClass = 'CE2';
                                else if (age === 10) defaultClass = 'CM1';
                                else if (age >= 11) defaultClass = 'CM2';
                            }
                            
                            console.log(`   🔧 ${child.firstName} ${child.lastName} (âge: ${age || 'inconnu'}) -> ${defaultClass}`);
                            
                            return {
                                ...child,
                                requestedClass: defaultClass
                            };
                        }
                        return child;
                    });

                    // Mettre à jour la demande
                    await prisma.preInscriptionRequest.update({
                        where: { id: problemRequest.id },
                        data: {
                            children: JSON.stringify(correctedChildren)
                        }
                    });

                    console.log(`   ✅ Demande ${problemRequest.id} corrigée`);
                }
            }
        } else {
            console.log('✅ Aucune demande avec requestedClass undefined trouvée');
        }

        // 3. Créer un mapping des classes disponibles pour éviter les futures erreurs
        console.log('\n📚 Vérification des classes disponibles...');
        
        const availableClasses = await prisma.classe.findMany({
            select: { nom: true, niveau: true },
            orderBy: { id: 'asc' }
        });

        console.log('Classes disponibles dans la base :');
        console.table(availableClasses);

        // 4. Vérifier que les classes demandées correspondent aux classes disponibles
        console.log('\n🔍 Vérification correspondance classes demandées/disponibles...');
        
        const updatedRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                OR: [
                    { status: 'PENDING' },
                    { status: 'EMAIL_PENDING' }
                ]
            }
        });

        let missingClasses = new Set();

        for (const request of updatedRequests) {
            try {
                if (request.children) {
                    const children = JSON.parse(request.children);
                    children.forEach(child => {
                        if (child.requestedClass) {
                            const classExists = availableClasses.some(cls => 
                                cls.nom === child.requestedClass || 
                                cls.nom.includes(child.requestedClass) ||
                                cls.niveau === child.requestedClass
                            );
                            
                            if (!classExists) {
                                missingClasses.add(child.requestedClass);
                            }
                        }
                    });
                }
            } catch (e) {
                // Ignorer les erreurs de parsing
            }
        }

        if (missingClasses.size > 0) {
            console.log('\n⚠️  Classes demandées mais non disponibles en base :');
            console.log(Array.from(missingClasses));
            
            console.log('\n🏗️  Création des classes manquantes...');
            for (const className of missingClasses) {
                try {
                    await prisma.classe.create({
                        data: {
                            nom: className,
                            niveau: className,
                            anneeScolaire: '2025-2026'
                        }
                    });
                    console.log(`   ✅ Classe créée : ${className}`);
                } catch (error) {
                    console.log(`   ❌ Erreur création ${className} : ${error.message}`);
                }
            }
        } else {
            console.log('✅ Toutes les classes demandées sont disponibles');
        }

        // 5. Résumé final
        console.log('\n📋 RÉSUMÉ DE LA CORRECTION :');
        console.log('='.repeat(50));
        
        const finalRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                OR: [
                    { status: 'PENDING' },
                    { status: 'EMAIL_PENDING' }
                ]
            }
        });

        let finalProblematicCount = 0;
        for (const request of finalRequests) {
            try {
                if (request.children) {
                    const children = JSON.parse(request.children);
                    const hasUndefinedClass = children.some(child => 
                        !child.requestedClass || child.requestedClass === 'undefined' || child.requestedClass === ''
                    );
                    if (hasUndefinedClass) finalProblematicCount++;
                }
            } catch (e) {
                finalProblematicCount++;
            }
        }

        console.log(`📊 Demandes avec problèmes AVANT : ${problematicRequests.length}`);
        console.log(`📊 Demandes avec problèmes APRÈS : ${finalProblematicCount}`);
        console.log(`📊 Classes disponibles : ${availableClasses.length}`);

        if (finalProblematicCount === 0) {
            console.log('✅ CORRECTION RÉUSSIE : Toutes les demandes ont un requestedClass valide !');
        } else {
            console.log('⚠️  ATTENTION : Problèmes subsistants détectés');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la correction :', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter la correction
if (require.main === module) {
    fixUndefinedRequestedClass().catch(console.error);
}

module.exports = { fixUndefinedRequestedClass };