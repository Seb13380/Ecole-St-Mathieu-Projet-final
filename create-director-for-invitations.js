const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createDirector() {
    try {
        console.log('👑 === Création d\'un compte Directeur pour le système d\'invitations ===\n');

        const email = 'directeur@ecole-saint-mathieu.fr';
        const firstName = 'Jean';
        const lastName = 'Directeur';
        const password = 'DirecteurSaintMathieu2024!';

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà.');

            if (existingUser.role !== 'DIRECTION') {
                // Mettre à jour vers le rôle DIRECTION
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { email: email },
                    data: {
                        password: hashedPassword,
                        role: 'DIRECTION',
                        firstName: firstName,
                        lastName: lastName
                    }
                });
                console.log('✅ Utilisateur mis à jour vers DIRECTION !');
            } else {
                console.log('✅ Le compte DIRECTION existe déjà !');
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                    phone: '04.91.12.34.56',
                    adress: 'École Saint-Mathieu',
                    role: 'DIRECTION'
                }
            });
            console.log('🎉 Compte Directeur créé avec succès !');
        }

        console.log('\n📋 Identifiants de connexion :');
        console.log('📧 Email: directeur@ecole-saint-mathieu.fr');
        console.log('🔑 Mot de passe: DirecteurSaintMathieu2024!');
        console.log('👑 Rôle: DIRECTION');

        console.log('\n🎯 Le directeur peut maintenant :');
        console.log('• Se connecter sur la plateforme');
        console.log('• Accéder à /parent-invitations/manage');
        console.log('• Créer des invitations pour les parents');
        console.log('• Envoyer des liens d\'inscription par email');

        // Créer quelques classes si elles n'existent pas
        const classes = [
            { nom: 'CP', niveau: 'Élémentaire' },
            { nom: 'CE1', niveau: 'Élémentaire' },
            { nom: 'CE2', niveau: 'Élémentaire' },
            { nom: 'CM1', niveau: 'Élémentaire' },
            { nom: 'CM2', niveau: 'Élémentaire' }
        ];

        for (const classeData of classes) {
            await prisma.classe.upsert({
                where: { nom: classeData.nom },
                update: {},
                create: {
                    nom: classeData.nom,
                    niveau: classeData.niveau,
                    anneeScolaire: '2024-2025'
                }
            });
        }

        console.log('✅ Classes créées/vérifiées pour les invitations');

    } catch (error) {
        console.error('❌ Erreur lors de la création du directeur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDirector();
