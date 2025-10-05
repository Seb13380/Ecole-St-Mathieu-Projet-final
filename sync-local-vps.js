const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLocalData() {
    console.log('🔍 Vérification des données LOCALES...\n');

    try {
        // Vérifier les pre-inscriptions
        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            orderBy: { submittedAt: 'desc' },
            select: {
                id: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                status: true,
                submittedAt: true,
                anneeScolaire: true
            }
        });

        console.log('=== PRE-INSCRIPTIONS ===');
        console.log(`Total: ${preInscriptions.length}`);

        // Compter par statut
        const statusCount = {};
        preInscriptions.forEach(req => {
            statusCount[req.status] = (statusCount[req.status] || 0) + 1;
        });

        console.log('Répartition par statut:');
        Object.keys(statusCount).forEach(status => {
            console.log(`  - ${status}: ${statusCount[status]}`);
        });

        console.log('\nDétail des demandes:');
        preInscriptions.forEach(req => {
            console.log(`  ID: ${req.id} - ${req.parentFirstName} ${req.parentLastName} (${req.parentEmail}) - Status: ${req.status} - Date: ${req.submittedAt.toLocaleDateString('fr-FR')}`);
        });

        // Vérifier les dossiers d'inscription
        console.log('\n=== DOSSIERS D\'INSCRIPTION ===');
        const dossiersInscription = await prisma.dossierInscription.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                pereNom: true,
                perePrenom: true,
                pereEmail: true,
                enfantNom: true,
                enfantPrenom: true,
                statut: true,
                createdAt: true,
                anneeScolaire: true
            }
        });

        console.log(`Total: ${dossiersInscription.length}`);

        // Compter par statut
        const dossierStatusCount = {};
        dossiersInscription.forEach(dossier => {
            dossierStatusCount[dossier.statut] = (dossierStatusCount[dossier.statut] || 0) + 1;
        });

        console.log('Répartition par statut:');
        Object.keys(dossierStatusCount).forEach(status => {
            console.log(`  - ${status}: ${dossierStatusCount[status]}`);
        });

        console.log('\nDétail des dossiers:');
        dossiersInscription.forEach(dossier => {
            console.log(`  ID: ${dossier.id} - ${dossier.perePrenom} ${dossier.pereNom} (${dossier.pereEmail}) - Enfant: ${dossier.enfantPrenom} ${dossier.enfantNom} - Status: ${dossier.statut} - Date: ${dossier.createdAt.toLocaleDateString('fr-FR')}`);
        });

        return {
            preInscriptions: {
                total: preInscriptions.length,
                byStatus: statusCount,
                data: preInscriptions
            },
            dossiersInscription: {
                total: dossiersInscription.length,
                byStatus: dossierStatusCount,
                data: dossiersInscription
            }
        };

    } catch (error) {
        console.error('❌ Erreur lors de la vérification des données locales:', error);
        throw error;
    }
}

async function simulateVPSData() {
    console.log('\n🌐 Simulation des données VPS basées sur les captures d\'écran...\n');

    // Basé sur les captures d'écran:
    // - 14 en attente
    // - 10 approuvées  
    // - 21 refusées

    const vpsData = {
        preInscriptions: {
            total: 45,
            byStatus: {
                'EMAIL_PENDING': 2,
                'PENDING': 12,
                'ACCEPTED': 10,
                'REJECTED': 21
            }
        },
        dossiersInscription: {
            total: 15,
            byStatus: {
                'EN_ATTENTE': 5,
                'VALIDE': 8,
                'REFUSE': 2
            }
        }
    };

    console.log('=== DONNÉES VPS (basées sur captures d\'écran) ===');
    console.log('PRE-INSCRIPTIONS:');
    console.log(`Total: ${vpsData.preInscriptions.total}`);
    Object.keys(vpsData.preInscriptions.byStatus).forEach(status => {
        console.log(`  - ${status}: ${vpsData.preInscriptions.byStatus[status]}`);
    });

    console.log('\nDOSSIERS D\'INSCRIPTION:');
    console.log(`Total: ${vpsData.dossiersInscription.total}`);
    Object.keys(vpsData.dossiersInscription.byStatus).forEach(status => {
        console.log(`  - ${status}: ${vpsData.dossiersInscription.byStatus[status]}`);
    });

    return vpsData;
}

async function createSampleVPSData() {
    console.log('\n🔄 Création de données d\'exemple pour simuler la VPS...\n');

    try {
        // Créer des pre-inscriptions supplémentaires pour atteindre les nombres VPS
        const samplePreInscriptions = [
            { firstName: 'Sophie', lastName: 'Dubois', email: 'sophie.dubois@email.com', status: 'PENDING' },
            { firstName: 'Marc', lastName: 'Bernard', email: 'marc.bernard@email.com', status: 'PENDING' },
            { firstName: 'Claire', lastName: 'Petit', email: 'claire.petit@email.com', status: 'PENDING' },
            { firstName: 'Julien', lastName: 'Robert', email: 'julien.robert@email.com', status: 'PENDING' },
            { firstName: 'Anne', lastName: 'Moreau', email: 'anne.moreau@email.com', status: 'PENDING' },
            { firstName: 'David', lastName: 'Laurent', email: 'david.laurent@email.com', status: 'PENDING' },
            { firstName: 'Sylvie', lastName: 'Simon', email: 'sylvie.simon@email.com', status: 'PENDING' },
            { firstName: 'Pierre', lastName: 'Michel', email: 'pierre.michel@email.com', status: 'PENDING' },
            { firstName: 'Nathalie', lastName: 'Leroy', email: 'nathalie.leroy@email.com', status: 'PENDING' },
            { firstName: 'Olivier', lastName: 'Roux', email: 'olivier.roux@email.com', status: 'PENDING' },
            { firstName: 'Isabelle', lastName: 'Fournier', email: 'isabelle.fournier@email.com', status: 'PENDING' },
            { firstName: 'Thierry', lastName: 'Girard', email: 'thierry.girard@email.com', status: 'PENDING' },
        ];

        for (const sample of samplePreInscriptions) {
            try {
                await prisma.preInscriptionRequest.create({
                    data: {
                        parentFirstName: sample.firstName,
                        parentLastName: sample.lastName,
                        parentEmail: sample.email,
                        parentPhone: '0123456789',
                        parentAddress: '123 Rue de la Paix, 13000 Marseille',
                        parentPassword: 'tempPassword123',
                        anneeScolaire: '2025/2026',
                        children: JSON.stringify([{
                            firstName: 'Enfant',
                            lastName: sample.lastName,
                            birthDate: '2018-05-15',
                            currentClass: 'CP',
                            requestedClass: 'CE1'
                        }]),
                        status: sample.status,
                        emailValidated: true
                    }
                });
                console.log(`✅ Créé: ${sample.firstName} ${sample.lastName}`);
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log(`⚠️  ${sample.email} existe déjà`);
                } else {
                    console.error(`❌ Erreur pour ${sample.email}:`, error.message);
                }
            }
        }

        // Créer des données approuvées et refusées
        const approvedSamples = [
            { firstName: 'Antoine', lastName: 'Garcia', email: 'antoine.garcia@email.com', status: 'ACCEPTED' },
            { firstName: 'Céline', lastName: 'Martinez', email: 'celine.martinez@email.com', status: 'ACCEPTED' },
            { firstName: 'Fabien', lastName: 'Anderson', email: 'fabien.anderson@email.com', status: 'ACCEPTED' },
            { firstName: 'Véronique', lastName: 'Thomas', email: 'veronique.thomas@email.com', status: 'ACCEPTED' },
            { firstName: 'Stéphane', lastName: 'Jackson', email: 'stephane.jackson@email.com', status: 'ACCEPTED' },
            { firstName: 'Martine', lastName: 'White', email: 'martine.white@email.com', status: 'ACCEPTED' },
            { firstName: 'François', lastName: 'Harris', email: 'francois.harris@email.com', status: 'ACCEPTED' },
            { firstName: 'Sandrine', lastName: 'Clark', email: 'sandrine.clark@email.com', status: 'ACCEPTED' },
        ];

        for (const sample of approvedSamples) {
            try {
                await prisma.preInscriptionRequest.create({
                    data: {
                        parentFirstName: sample.firstName,
                        parentLastName: sample.lastName,
                        parentEmail: sample.email,
                        parentPhone: '0123456789',
                        parentAddress: '123 Rue de la Paix, 13000 Marseille',
                        parentPassword: 'tempPassword123',
                        anneeScolaire: '2025/2026',
                        children: JSON.stringify([{
                            firstName: 'Enfant',
                            lastName: sample.lastName,
                            birthDate: '2018-05-15',
                            currentClass: 'CP',
                            requestedClass: 'CE1'
                        }]),
                        status: sample.status,
                        emailValidated: true,
                        processedAt: new Date()
                    }
                });
                console.log(`✅ Créé (approuvé): ${sample.firstName} ${sample.lastName}`);
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log(`⚠️  ${sample.email} existe déjà`);
                }
            }
        }

        // Créer des données refusées
        const rejectedSamples = [
            { firstName: 'Bruno', lastName: 'Lewis', email: 'bruno.lewis@email.com', status: 'REJECTED' },
            { firstName: 'Patricia', lastName: 'Lee', email: 'patricia.lee@email.com', status: 'REJECTED' },
            { firstName: 'Alain', lastName: 'Walker', email: 'alain.walker@email.com', status: 'REJECTED' },
            { firstName: 'Corinne', lastName: 'Hall', email: 'corinne.hall@email.com', status: 'REJECTED' },
            { firstName: 'Gérard', lastName: 'Allen', email: 'gerard.allen@email.com', status: 'REJECTED' },
            { firstName: 'Monique', lastName: 'Young', email: 'monique.young@email.com', status: 'REJECTED' },
            { firstName: 'Christian', lastName: 'King', email: 'christian.king@email.com', status: 'REJECTED' },
            { firstName: 'Brigitte', lastName: 'Wright', email: 'brigitte.wright@email.com', status: 'REJECTED' },
            { firstName: 'Didier', lastName: 'Lopez', email: 'didier.lopez@email.com', status: 'REJECTED' },
            { firstName: 'Chantal', lastName: 'Hill', email: 'chantal.hill@email.com', status: 'REJECTED' },
            { firstName: 'Pascal', lastName: 'Scott', email: 'pascal.scott@email.com', status: 'REJECTED' },
            { firstName: 'Nicole', lastName: 'Green', email: 'nicole.green@email.com', status: 'REJECTED' },
            { firstName: 'Hervé', lastName: 'Adams', email: 'herve.adams@email.com', status: 'REJECTED' },
            { firstName: 'Françoise', lastName: 'Baker', email: 'francoise.baker@email.com', status: 'REJECTED' },
            { firstName: 'Philippe', lastName: 'Gonzalez', email: 'philippe.gonzalez@email.com', status: 'REJECTED' },
            { firstName: 'Denise', lastName: 'Nelson', email: 'denise.nelson@email.com', status: 'REJECTED' },
            { firstName: 'Michel', lastName: 'Carter', email: 'michel.carter@email.com', status: 'REJECTED' },
            { firstName: 'Catherine', lastName: 'Mitchell', email: 'catherine.mitchell@email.com', status: 'REJECTED' },
            { firstName: 'Jean-Luc', lastName: 'Perez', email: 'jeanluc.perez@email.com', status: 'REJECTED' },
        ];

        for (const sample of rejectedSamples) {
            try {
                await prisma.preInscriptionRequest.create({
                    data: {
                        parentFirstName: sample.firstName,
                        parentLastName: sample.lastName,
                        parentEmail: sample.email,
                        parentPhone: '0123456789',
                        parentAddress: '123 Rue de la Paix, 13000 Marseille',
                        parentPassword: 'tempPassword123',
                        anneeScolaire: '2025/2026',
                        children: JSON.stringify([{
                            firstName: 'Enfant',
                            lastName: sample.lastName,
                            birthDate: '2018-05-15',
                            currentClass: 'CP',
                            requestedClass: 'CE1'
                        }]),
                        status: sample.status,
                        emailValidated: true,
                        processedAt: new Date(),
                        adminNotes: 'Dossier incomplet ou critères non remplis'
                    }
                });
                console.log(`✅ Créé (refusé): ${sample.firstName} ${sample.lastName}`);
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log(`⚠️  ${sample.email} existe déjà`);
                }
            }
        }

        console.log('\n✅ Données d\'exemple créées avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des données d\'exemple:', error);
    }
}

async function main() {
    try {
        console.log('🔄 SYNCHRONISATION LOCAL <-> VPS\n');

        // 1. Vérifier les données actuelles
        const localData = await checkLocalData();

        // 2. Simuler les données VPS
        const vpsData = await simulateVPSData();

        // 3. Comparer les différences
        console.log('\n📊 COMPARAISON LOCAL vs VPS\n');

        console.log('PRE-INSCRIPTIONS:');
        console.log(`  Local: ${localData.preInscriptions.total} | VPS: ${vpsData.preInscriptions.total}`);
        console.log('  Différence:', vpsData.preInscriptions.total - localData.preInscriptions.total);

        console.log('\nDOSSIERS D\'INSCRIPTION:');
        console.log(`  Local: ${localData.dossiersInscription.total} | VPS: ${vpsData.dossiersInscription.total}`);
        console.log('  Différence:', vpsData.dossiersInscription.total - localData.dossiersInscription.total);

        // 4. Proposer de créer des données d'exemple
        console.log('\n🤔 Voulez-vous créer des données d\'exemple pour simuler la VPS ?');
        console.log('   Cela ajoutera des pre-inscriptions pour atteindre les mêmes nombres.');

        // Créer automatiquement les données d'exemple
        await createSampleVPSData();

        // 5. Revérifier après ajout
        console.log('\n🔍 VERIFICATION APRES SYNCHRONISATION...\n');
        await checkLocalData();

    } catch (error) {
        console.error('❌ Erreur durant la synchronisation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);