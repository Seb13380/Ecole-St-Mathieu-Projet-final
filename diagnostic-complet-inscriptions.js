// 🔍 DIAGNOSTIC COMPLET - Vérification des statuts et compteurs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticComplet() {
    try {
        console.log('🔍 DIAGNOSTIC COMPLET DES DEMANDES D\'INSCRIPTION\n');

        // 1. Vérifier toutes les tables et leurs statuts
        console.log('📊 1. COMPTAGE PAR TABLE ET STATUT:\n');

        // PreInscriptionRequest
        const preInscriptionStatus = await prisma.preInscriptionRequest.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        console.log('📋 PreInscriptionRequest:');
        preInscriptionStatus.forEach(s => {
            console.log(`   ${s.status}: ${s._count.status} demandes`);
        });

        // DossierInscription
        const dossierStatus = await prisma.dossierInscription.groupBy({
            by: ['statut'],
            _count: { statut: true }
        });

        console.log('\n📄 DossierInscription:');
        dossierStatus.forEach(s => {
            console.log(`   ${s.statut}: ${s._count.statut} demandes`);
        });

        // InscriptionRequest (au cas où)
        const inscriptionCount = await prisma.inscriptionRequest.count();
        console.log(`\n📝 InscriptionRequest: ${inscriptionCount} demandes\n`);

        // 2. Vérifier la demande spécifique de Julia (ID visible dans les captures)
        console.log('🎯 2. VÉRIFICATION DEMANDE JULIA DUSSAUCY:\n');

        // Chercher Julia dans toutes les tables
        const juliaPreInsc = await prisma.preInscriptionRequest.findMany({
            where: {
                OR: [
                    { parentFirstName: { contains: 'JULIA' } },
                    { parentLastName: { contains: 'DUSSAUCY' } },
                    { parentEmail: { contains: 'juliafuchs1504' } }
                ]
            },
            select: {
                id: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                status: true,
                submittedAt: true
            }
        });

        const juliaDossier = await prisma.dossierInscription.findMany({
            where: {
                OR: [
                    { perePrenom: { contains: 'JULIA' } },
                    { pereNom: { contains: 'DUSSAUCY' } },
                    { pereEmail: { contains: 'juliafuchs1504' } }
                ]
            },
            select: {
                id: true,
                perePrenom: true,
                pereNom: true,
                pereEmail: true,
                statut: true,
                createdAt: true
            }
        });

        console.log('📋 Julia dans PreInscriptionRequest:');
        if (juliaPreInsc.length === 0) {
            console.log('   ❌ Aucune entrée trouvée');
        } else {
            juliaPreInsc.forEach(j => {
                console.log(`   ID ${j.id}: ${j.parentFirstName} ${j.parentLastName} - ${j.status} (${j.submittedAt.toLocaleString('fr-FR')})`);
            });
        }

        console.log('\n📄 Julia dans DossierInscription:');
        if (juliaDossier.length === 0) {
            console.log('   ❌ Aucune entrée trouvée');
        } else {
            juliaDossier.forEach(j => {
                console.log(`   ID ${j.id}: ${j.perePrenom} ${j.pereNom} - ${j.statut} (${j.createdAt.toLocaleString('fr-FR')})`);
            });
        }

        // 3. Vérifier les 5 dernières demandes récentes
        console.log('\n📅 3. DERNIÈRES DEMANDES (TOUTES TABLES):\n');

        const recentPre = await prisma.preInscriptionRequest.findMany({
            orderBy: { submittedAt: 'desc' },
            take: 3,
            select: {
                id: true,
                parentFirstName: true,
                parentLastName: true,
                status: true,
                submittedAt: true
            }
        });

        const recentDossier = await prisma.dossierInscription.findMany({
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
                id: true,
                perePrenom: true,
                pereNom: true,
                statut: true,
                createdAt: true
            }
        });

        console.log('📋 3 dernières PreInscriptions:');
        recentPre.forEach((r, i) => {
            console.log(`   ${i + 1}. ID ${r.id}: ${r.parentFirstName} ${r.parentLastName} - ${r.status}`);
        });

        console.log('\n📄 3 derniers Dossiers:');
        recentDossier.forEach((r, i) => {
            console.log(`   ${i + 1}. ID ${r.id}: ${r.perePrenom} ${r.pereNom} - ${r.statut}`);
        });

        // 4. Calculer les vrais totaux
        const pendingPre = preInscriptionStatus.find(s => s.status === 'PENDING' || s.status === 'EMAIL_PENDING');
        const totalPreEnAttente = pendingPre ? pendingPre._count.status : 0;

        const pendingDossier = dossierStatus.find(s => s.statut === 'EN_ATTENTE');
        const totalDossierEnAttente = pendingDossier ? pendingDossier._count.statut : 0;

        console.log('\n🎯 4. TOTAUX CALCULÉS:');
        console.log(`   En attente total: ${totalPreEnAttente + totalDossierEnAttente}`);
        console.log(`   - PreInscriptions: ${totalPreEnAttente}`);
        console.log(`   - Dossiers: ${totalDossierEnAttente}`);

    } catch (error) {
        console.error('❌ Erreur diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticComplet();