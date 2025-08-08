const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleActualites() {
    console.log('📰 Création d\'actualités d\'exemple...');

    try {
        // Récupérer des utilisateurs autorisés
        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'DIRECTION', 'ENSEIGNANT', 'MAINTENANCE_SITE']
                }
            }
        });

        if (users.length === 0) {
            console.log('❌ Aucun utilisateur autorisé trouvé');
            return;
        }

        const actualitesExemples = [
            {
                titre: "Rentrée scolaire 2024-2025",
                contenu: `
                    <h2>Informations importantes pour la rentrée</h2>
                    <p>Chers parents,</p>
                    <p>Nous avons le plaisir de vous accueillir pour cette nouvelle année scolaire qui débutera le <strong>lundi 2 septembre 2024</strong>.</p>
                    
                    <h3>📅 Horaires d'accueil :</h3>
                    <ul>
                        <li><strong>Maternelle :</strong> 8h30 - 16h30</li>
                        <li><strong>Primaire :</strong> 8h15 - 16h45</li>
                    </ul>
                    
                    <h3>📋 Documents à apporter :</h3>
                    <ul>
                        <li>Certificat médical</li>
                        <li>Assurance scolaire</li>
                        <li>Fiche de renseignements complétée</li>
                    </ul>
                    
                    <p>Nous nous réjouissons de retrouver vos enfants !</p>
                    <p><em>L'équipe pédagogique</em></p>
                `,
                important: true,
                visible: true,
                auteurId: users.find(u => u.role === 'DIRECTION')?.id || users[0].id
            },
            {
                titre: "Sortie pédagogique au Muséum",
                contenu: `
                    <h2>Sortie découverte pour les classes de CE2-CM1</h2>
                    <p>Le <strong>vendredi 15 novembre</strong>, les classes de CE2 et CM1 se rendront au Muséum d'Histoire Naturelle dans le cadre de notre projet "Sciences et Découvertes".</p>
                    
                    <h3>🚌 Organisation :</h3>
                    <ul>
                        <li><strong>Départ :</strong> 9h00 devant l'école</li>
                        <li><strong>Retour :</strong> 16h00</li>
                        <li><strong>Repas :</strong> Pique-nique fourni par l'école</li>
                    </ul>
                    
                    <p>Pensez à prévoir une tenue confortable et des chaussures de marche.</p>
                `,
                important: false,
                visible: true,
                auteurId: users.find(u => u.role === 'ENSEIGNANT')?.id || users[0].id
            },
            {
                titre: "Nouveau système de restauration",
                contenu: `
                    <h2>Mise en place des tickets numériques</h2>
                    <p>À partir du <strong>1er décembre 2024</strong>, nous mettons en place un nouveau système de restauration basé sur des tickets numériques.</p>
                    
                    <h3>✨ Avantages :</h3>
                    <ul>
                        <li>Plus de tickets papier à perdre</li>
                        <li>Suivi en temps réel</li>
                        <li>Réservation en ligne</li>
                        <li>Paiement sécurisé</li>
                    </ul>
                    
                    <p>Des formations parents seront organisées la semaine prochaine.</p>
                `,
                important: false,
                visible: true,
                auteurId: users.find(u => u.role === 'ADMIN')?.id || users[0].id
            },
            {
                titre: "Réunion parents-professeurs",
                contenu: `
                    <h2>Rencontre individuelle avec les enseignants</h2>
                    <p>Les réunions parents-professeurs auront lieu du <strong>7 au 11 octobre 2024</strong>.</p>
                    
                    <h3>📝 Modalités :</h3>
                    <ul>
                        <li>Rendez-vous individuels de 15 minutes</li>
                        <li>Inscription obligatoire via le carnet de liaison</li>
                        <li>Horaires : 16h30 à 19h00</li>
                    </ul>
                    
                    <p>Ces rencontres sont l'occasion de faire le point sur l'adaptation et les progrès de votre enfant.</p>
                `,
                important: true,
                visible: true,
                auteurId: users.find(u => u.role === 'DIRECTION')?.id || users[0].id
            }
        ];

        for (const actualiteData of actualitesExemples) {
            await prisma.actualite.create({
                data: actualiteData
            });
            console.log(`✅ Actualité créée : "${actualiteData.titre}"`);
        }

        console.log('\n🎉 Actualités d\'exemple créées avec succès !');

        // Afficher le résumé
        const count = await prisma.actualite.count();
        console.log(`📊 Total d'actualités en base : ${count}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleActualites();
