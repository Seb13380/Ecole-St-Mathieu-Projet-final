// 🚨 DIAGNOSTIC URGENT LOCAL - Avant intervention directrice OGEC
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticUrgentLocal() {
    try {
        console.log('🚨 DIAGNOSTIC URGENT LOCAL - SÉCURITÉ OGEC\n');

        // 1. Vérifier les demandes récentes avec leur statut exact
        console.log('📋 DEMANDES AVEC STATUTS EXACTS:');

        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            orderBy: { submittedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                status: true,
                submittedAt: true
            }
        });

        preInscriptions.forEach((req, i) => {
            console.log(`${i + 1}. ID ${req.id}: ${req.parentFirstName} ${req.parentLastName}`);
            console.log(`   📧 ${req.parentEmail}`);
            console.log(`   📊 STATUS: "${req.status}"`);
            console.log(`   📅 ${req.submittedAt.toLocaleString('fr-FR')}\n`);
        });

        // 2. Compter par STATUS exact
        const statusCounts = await prisma.preInscriptionRequest.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        console.log('📊 RÉPARTITION EXACTE PAR STATUT:');
        statusCounts.forEach(stat => {
            console.log(`   "${stat.status}": ${stat._count.status} demandes`);
        });

        // 3. Dossiers d'inscription aussi
        const dossierCounts = await prisma.dossierInscription.groupBy({
            by: ['statut'],
            _count: { statut: true }
        });

        console.log('\n📄 DOSSIERS INSCRIPTION PAR STATUT:');
        dossierCounts.forEach(stat => {
            console.log(`   "${stat.statut}": ${stat._count.statut} dossiers`);
        });

        // 4. Vérifier s'il y a des demandes "JULIA DUSSAUCY"
        const julia = await prisma.preInscriptionRequest.findMany({
            where: {
                OR: [
                    { parentFirstName: { contains: 'JULIA', mode: 'insensitive' } },
                    { parentLastName: { contains: 'DUSSAUCY', mode: 'insensitive' } }
                ]
            }
        });

        console.log('\n🔍 RECHERCHE JULIA DUSSAUCY:');
        if (julia.length > 0) {
            julia.forEach(j => {
                console.log(`   ✅ TROUVÉE: ${j.parentFirstName} ${j.parentLastName} - STATUS: ${j.status}`);
            });
        } else {
            console.log('   ❌ JULIA DUSSAUCY NON TROUVÉE EN LOCAL');
        }

        console.log('\n🚨 STATUT CRITIQUE: Prêt pour directrice OGEC !');

    } catch (error) {
        console.error('❌ ERREUR CRITIQUE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticUrgentLocal();