const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugFinalizationProcess() {
    try {
        console.log('🔍 Debug du processus de finalisation...\n');

        // 1. Vérifier les demandes ACCEPTED qui peuvent être finalisées
        const acceptedRequests = await prisma.preInscriptionRequest.findMany({
            where: { status: 'ACCEPTED' }
        });

        console.log(`📊 Demandes ACCEPTED: ${acceptedRequests.length}`);

        acceptedRequests.forEach(req => {
            console.log(`   ID: ${req.id} | ${req.parentFirstName} ${req.parentLastName} | Status: ${req.status}`);
        });

        // 2. Vérifier les dossiers VALIDE qui peuvent être finalisés
        const valideDossiers = await prisma.dossierInscription.findMany({
            where: { statut: 'VALIDE' }
        });

        console.log(`\n📊 Dossiers VALIDE: ${valideDossiers.length}`);

        valideDossiers.forEach(dossier => {
            console.log(`   ID: ${dossier.id} | ${dossier.enfantPrenom} ${dossier.enfantNom} | Status: ${dossier.statut}`);
        });

        // 3. Vérifier les comptes parents créés
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: {
                students: true
            }
        });

        console.log(`\n👨‍👩‍👧‍👦 Parents créés: ${parents.length}`);

        parents.forEach(parent => {
            console.log(`   ${parent.firstName} ${parent.lastName} (${parent.email}) - ${parent.students.length} enfant(s)`);
        });

        // 4. Vérifier les enfants créés
        const students = await prisma.student.findMany({
            include: {
                parent: true
            }
        });

        console.log(`\n👶 Élèves créés: ${students.length}`);

        students.forEach(student => {
            const parentInfo = student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : 'Aucun parent';
            console.log(`   ${student.firstName} ${student.lastName} - Parent: ${parentInfo}`);
        });

        // 5. Vérifier les demandes FINALISEES
        const finalizedPreInscriptions = await prisma.preInscriptionRequest.findMany({
            where: { status: 'FINALIZED' }
        });

        const finalizedDossiers = await prisma.dossierInscription.findMany({
            where: { statut: 'FINALISE' }
        });

        console.log(`\n✅ Demandes FINALISEES:`);
        console.log(`   PreInscriptionRequest: ${finalizedPreInscriptions.length}`);
        console.log(`   DossierInscription: ${finalizedDossiers.length}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugFinalizationProcess();