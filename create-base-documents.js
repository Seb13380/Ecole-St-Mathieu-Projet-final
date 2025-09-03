const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDocuments() {
    try {
        console.log('📄 Création des documents de base...');

        // Récupérer le premier utilisateur pour auteur
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('❌ Aucun utilisateur trouvé ! Créez d\'abord un utilisateur.');
            return;
        }

        console.log(`✅ Utilisation de l'utilisateur: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

        // Documents publics (première carte - accès libre)
        const projetEducatif = await prisma.document.create({
            data: {
                type: 'PROJET_EDUCATIF',
                titre: 'Projet éducatif de l\'École Saint-Mathieu',
                description: 'Notre vision pédagogique et nos valeurs éducatives pour accompagner chaque enfant.',
                contenu: `<h1>Projet Éducatif de l'École Saint-Mathieu</h1>
                
<h2>Notre Vision</h2>
<p>L'École Saint-Mathieu s'engage à offrir une éducation de qualité, respectueuse de chaque enfant et de sa singularité. Notre projet éducatif s'articule autour de valeurs chrétiennes et humanistes.</p>

<h2>Nos Objectifs</h2>
<ul>
<li>Développer l'autonomie et la confiance en soi</li>
<li>Favoriser l'esprit critique et la créativité</li>
<li>Cultiver le respect mutuel et la tolérance</li>
<li>Encourager l'ouverture sur le monde</li>
</ul>

<h2>Notre Pédagogie</h2>
<p>Nous privilégions une pédagogie différenciée qui s'adapte aux besoins de chaque élève, dans un environnement bienveillant et stimulant.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        const projetEtablissement = await prisma.document.create({
            data: {
                type: 'PROJET_ETABLISSEMENT',
                titre: 'Projet d\'établissement 2024-2027',
                description: 'Les orientations stratégiques et objectifs de notre établissement pour les trois prochaines années.',
                contenu: `<h1>Projet d'Établissement 2024-2027</h1>
                
<h2>Axe 1: Excellence Pédagogique</h2>
<p>Renforcer la qualité des apprentissages par des méthodes innovantes et personnalisées.</p>

<h2>Axe 2: Vivre Ensemble</h2>
<p>Développer un climat scolaire serein basé sur le respect mutuel et la bienveillance.</p>

<h2>Axe 3: Ouverture sur le Monde</h2>
<p>Multiplier les échanges culturels et les projets d'ouverture internationale.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        // Documents publics individuels
        const reglementInterieur = await prisma.document.create({
            data: {
                type: 'REGLEMENT_INTERIEUR',
                titre: 'Règlement intérieur',
                description: 'Les règles de vie et le fonctionnement de notre établissement.',
                contenu: `<h1>Règlement Intérieur</h1>
                
<h2>Horaires</h2>
<p>L'école est ouverte de 8h00 à 17h00.</p>

<h2>Discipline</h2>
<p>Le respect mutuel est la base de notre vie scolaire.</p>

<h2>Uniforme</h2>
<p>Le port de l'uniforme est obligatoire pour tous les élèves.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        const dossierInscription = await prisma.document.create({
            data: {
                type: 'DOSSIER_INSCRIPTION',
                titre: 'Dossier d\'inscription 2025-2026',
                description: 'Toutes les informations et documents nécessaires pour inscrire votre enfant.',
                contenu: `<h1>Dossier d'Inscription</h1>
                
<h2>Pièces à fournir</h2>
<ul>
<li>Fiche de renseignements complétée</li>
<li>Copie du livret de famille</li>
<li>Certificat de radiation (si changement d'école)</li>
<li>Certificat médical</li>
</ul>

<h2>Tarifs</h2>
<p>Les tarifs sont adaptés aux revenus des familles. N'hésitez pas à nous contacter.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        // Documents restreints (accès membres uniquement)
        const organigramme = await prisma.document.create({
            data: {
                type: 'ORGANIGRAMME',
                titre: 'Organigramme de l\'établissement',
                description: 'Structure organisationnelle et contacts de l\'équipe éducative.',
                contenu: `<h1>Organigramme</h1>
                
<h2>Direction</h2>
<ul>
<li>Chef d'établissement: M. Lionel MARTIN</li>
<li>Directeur adjoint: M. Frank GIORDANO</li>
</ul>

<h2>Équipe pédagogique</h2>
<p>Une équipe de 15 enseignants dévoués à la réussite de vos enfants.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        const charteNumérique = await prisma.document.create({
            data: {
                type: 'CHARTE_NUMERIQUE',
                titre: 'Charte du numérique',
                description: 'Règles d\'usage des outils numériques dans l\'établissement.',
                contenu: `<h1>Charte du Numérique</h1>
                
<h2>Usage responsable</h2>
<p>Les outils numériques sont mis à disposition pour enrichir les apprentissages.</p>

<h2>Règles de sécurité</h2>
<p>Internet est un outil formidable mais qui nécessite vigilance et prudence.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        const charteVieScolaire = await prisma.document.create({
            data: {
                type: 'CHARTE_VIE_SCOLAIRE',
                titre: 'Charte de vie scolaire',
                description: 'Nos règles de vivre ensemble au quotidien.',
                contenu: `<h1>Charte de Vie Scolaire</h1>
                
<h2>Respect</h2>
<p>Chacun a le droit d'être respecté dans sa personne et ses biens.</p>

<h2>Entraide</h2>
<p>Nous encourageons la solidarité et l'entraide entre élèves.</p>`,
                active: true,
                auteurId: user.id
            }
        });

        const agenda = await prisma.document.create({
            data: {
                type: 'AGENDA',
                titre: 'Agenda de l\'année scolaire',
                description: 'Calendrier des événements et activités de l\'école.',
                contenu: `<h1>Agenda 2024-2025</h1>
                
<h2>Septembre</h2>
<ul>
<li>2 septembre: Rentrée des classes</li>
<li>15 septembre: Réunion parents-enseignants</li>
</ul>

<h2>Octobre</h2>
<ul>
<li>Vacances de la Toussaint: du 19 octobre au 3 novembre</li>
</ul>`,
                active: true,
                auteurId: user.id
            }
        });

        console.log('✅ Documents créés avec succès !');
        console.log(`- Projet éducatif (ID: ${projetEducatif.id})`);
        console.log(`- Projet d'établissement (ID: ${projetEtablissement.id})`);
        console.log(`- Règlement intérieur (ID: ${reglementInterieur.id})`);
        console.log(`- Dossier d'inscription (ID: ${dossierInscription.id})`);
        console.log(`- Organigramme (ID: ${organigramme.id})`);
        console.log(`- Charte numérique (ID: ${charteNumérique.id})`);
        console.log(`- Charte vie scolaire (ID: ${charteVieScolaire.id})`);
        console.log(`- Agenda (ID: ${agenda.id})`);

    } catch (error) {
        console.error('❌ Erreur lors de la création des documents:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDocuments();
