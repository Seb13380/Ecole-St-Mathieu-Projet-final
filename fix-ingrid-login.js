/**
 * Script de diagnostic et correction du compte parent Ingrid Lebourgeois
 * ingrid.lebourgeois@gmail.com
 *
 * Ce script NE SUPPRIME AUCUNE DONNÉE.
 * Il vérifie l'existence du compte et corrige/crée le mot de passe si nécessaire.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const EMAIL = 'ingrid.lebourgeois@gmail.com';
// Mot de passe temporaire sécurisé – à communiquer à la maman
const NEW_PASSWORD = 'EcoleNicolas123!';

async function main() {
    console.log('=== DIAGNOSTIC COMPTE PARENT ===');
    console.log(`Email recherché : ${EMAIL}\n`);

    try {
        // 1) Chercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: EMAIL }
        });

        if (!user) {
            console.log('⚠️  Compte INTROUVABLE dans la base de données.');
            console.log('→  Création du compte parent...');

            const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
            const newUser = await prisma.user.create({
                data: {
                    firstName: 'Ingrid',
                    lastName: 'Lebourgeois',
                    email: EMAIL,
                    password: hashedPassword,
                    role: 'PARENT',
                    phone: null,
                    adress: null
                }
            });

            console.log(`\n✅ Compte créé avec succès !`);
            console.log(`   ID        : ${newUser.id}`);
            console.log(`   Prénom    : ${newUser.firstName}`);
            console.log(`   Nom       : ${newUser.lastName}`);
            console.log(`   Email     : ${newUser.email}`);
            console.log(`   Rôle      : ${newUser.role}`);
            console.log(`\n📧 Nouveau mot de passe temporaire : ${NEW_PASSWORD}`);
            console.log('   → Demandez à la maman de le changer après connexion.\n');

        } else {
            console.log(`✅ Compte TROUVÉ :`);
            console.log(`   ID        : ${user.id}`);
            console.log(`   Prénom    : ${user.firstName}`);
            console.log(`   Nom       : ${user.lastName}`);
            console.log(`   Email     : ${user.email}`);
            console.log(`   Rôle      : ${user.role}`);
            console.log(`   Mot passe : ${user.password ? 'défini' : 'ABSENT ⚠️'}`);
            console.log(`   Créé le   : ${user.createdAt}`);

            // Tester si l'ancien mot de passe correspond
            const testPasswords = ['écoleNicolasl23!', 'écoleNicolas123!', 'ecoleNicolas123!'];
            let matchFound = false;
            for (const pwd of testPasswords) {
                if (user.password) {
                    const matches = await bcrypt.compare(pwd, user.password);
                    if (matches) {
                        console.log(`\n✅ Le mot de passe "${pwd}" est CORRECT !`);
                        console.log('   → Le problème de connexion vient peut-être d\'autre chose.');
                        matchFound = true;
                        break;
                    }
                }
            }

            if (!matchFound) {
                console.log('\n❌ Aucun des mots de passe connus ne correspond.');
                console.log('→  Réinitialisation du mot de passe...');

                const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
                await prisma.user.update({
                    where: { email: EMAIL },
                    data: { password: hashedPassword }
                });

                console.log(`\n✅ Mot de passe réinitialisé avec succès !`);
                console.log(`📧 Nouveau mot de passe temporaire : ${NEW_PASSWORD}`);
                console.log('   → Demandez à la maman de le changer après connexion.\n');
            }
        }

        // 2) Vérifier les demandes d'identifiants existantes (sans rien supprimer)
        console.log('\n=== DEMANDES D\'IDENTIFIANTS (pour info) ===');
        try {
            const credRequests = await prisma.credentialsRequest.findMany({
                where: { requestedEmail: EMAIL },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

            if (credRequests.length === 0) {
                console.log('Aucune demande d\'identifiant soumise pour cet email.');
            } else {
                credRequests.forEach((r, i) => {
                    console.log(`  [${i + 1}] ID=${r.id} | Statut=${r.status} | ${r.createdAt.toLocaleString('fr-FR')}`);
                });
            }
        } catch (e) {
            console.log('(Table CredentialsRequest non accessible :', e.message, ')');
        }

    } catch (error) {
        console.error('\n❌ ERREUR :', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
