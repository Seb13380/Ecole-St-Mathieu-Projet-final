const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicates() {
    console.log('\n🔧 NETTOYAGE DES DOUBLONS D\'INSCRIPTIONS\n');
    console.log('='.repeat(80));

    try {
        // 1. Identifier les doublons (même email + même heure à quelques secondes près)
        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            orderBy: { submittedAt: 'asc' }
        });

        const duplicates = [];
        const seen = new Map();

        for (const req of preInscriptions) {
            const key = `${req.parentEmail}_${req.submittedAt.toISOString().slice(0, 16)}`; // Email + date/heure sans secondes

            if (seen.has(key)) {
                duplicates.push({
                    id: req.id,
                    original: seen.get(key),
                    duplicate: req
                });
            } else {
                seen.set(key, req);
            }
        }

        console.log(`\n📊 Doublons trouvés: ${duplicates.length}\n`);

        if (duplicates.length === 0) {
            console.log('✅ Aucun doublon à nettoyer');
            return;
        }

        // 2. Afficher les doublons trouvés
        for (const dup of duplicates) {
            console.log(`🔍 Doublon détecté:`);
            console.log(`   Original: ID ${dup.original.id} - ${dup.original.parentFirstName} ${dup.original.parentLastName}`);
            console.log(`   Date: ${dup.original.submittedAt.toLocaleString('fr-FR')}`);
            console.log(`   Doublon: ID ${dup.duplicate.id}`);
            console.log(`   Date: ${dup.duplicate.submittedAt.toLocaleString('fr-FR')}`);
            console.log(`   → À supprimer: ID ${dup.id}\n`);
        }

        // 3. Demander confirmation (désactivé pour automatisation - à activer en prod)
        console.log(`\n⚠️  ATTENTION: ${duplicates.length} doublons vont être supprimés`);
        console.log(`   Pour confirmer, commentez cette ligne et exécutez à nouveau\n`);

        // DÉCOMMENTEZ LES LIGNES SUIVANTES POUR SUPPRIMER LES DOUBLONS:
        /*
        for (const dup of duplicates) {
            await prisma.preInscriptionRequest.delete({
                where: { id: dup.id }
            });
            console.log(`✅ Supprimé: ID ${dup.id}`);
        }
        console.log(`\n✅ ${duplicates.length} doublons supprimés avec succès\n`);
        */

        console.log('='.repeat(80));
        console.log('ℹ️  Pour exécuter la suppression, décommentez les lignes dans le script\n');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDuplicates();
