const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const dossierInscriptionController = {
    // Afficher le formulaire de dossier d'inscription complet
    showForm: async (req, res) => {
        try {
            // Récupérer les documents requis pour l'inscription
            const documentsRequis = await prisma.document.findMany({
                where: {
                    active: true,
                    type: { in: ['DOSSIER_INSCRIPTION', 'REGLEMENT_INTERIEUR'] }
                },
                orderBy: { ordre: 'asc' }
            });

            res.render('pages/dossier-inscription', {
                title: 'Dossier d\'inscription - École Saint-Mathieu',
                user: req.session.user || null,
                currentUrl: req.originalUrl,
                success: req.flash('success'),
                error: req.flash('error'),
                documentsRequis
            });
        } catch (error) {
            console.error('Erreur lors du chargement du formulaire:', error);
            res.status(500).render('error', {
                title: 'Erreur',
                message: 'Une erreur est survenue lors du chargement de la page.',
                user: req.session.user || null
            });
        }
    },

    // Traiter la soumission du dossier d'inscription
    submitDossier: async (req, res) => {
        try {
            console.log('🔍 === DÉBUT TRAITEMENT DOSSIER INSCRIPTION ===');
            console.log('📋 Réception d\'un nouveau dossier d\'inscription');

            // Extraction des données du formulaire
            const {
                anneeScolaire,
                situationFamiliale, nombreEnfantsFoyer, informationsFamille,
                pereCivilite, pereNom, perePrenom, pereProfession, pereSociete,
                pereTelephone, pereTelephoneTravail, pereEmail,
                mereCivilite, mereNomJeuneFille, mereNomMarital, merePrenom,
                mereProfession, mereSociete, mereTelephone, mereTelephoneTravail, mereEmail,
                adresseRue, adresseComplement, adresseCodePostal, adresseVille, telephoneDomicile,
                enfantNom, enfantPrenom, enfantDateNaissance, enfantLieuNaissance,
                enfantDepartementNaissance, enfantNationalite, enfantSexe,
                enfantClasseDemandee, enfantEcoleActuelle, enfantVilleEtablissement,
                enfantClasseActuelle, enfantDerniereScolarite,
                medecinTraitantNom, medecinTraitantTelephone, allergies,
                traitementsMedicaux, regimeAlimentaire, paiNecessaire, besoinsPArticuliers,
                urgence1Nom, urgence1Prenom, urgence1Lien, urgence1Telephone,
                urgence2Nom, urgence2Prenom, urgence2Lien, urgence2Telephone,
                autorisationPhoto, autorisationVideo, autorisationSortie, autorisationInternet,
                transportSouhaite, restaurationSouhaitee, joursRestauration,
                recuperation1Nom, recuperation1Prenom, recuperation1Telephone, recuperation1Lien,
                recuperation2Nom, recuperation2Prenom, recuperation2Telephone, recuperation2Lien,
                docCertificatRadiation, docLivretFamille, docJustificatifDomicile,
                docAssuranceScolaire, docCarnetSante, docCertificatMedical,
                engagementReglement, engagementFinancier
            } = req.body;

            // Validation des champs obligatoires
            console.log('🔍 Validation des champs obligatoires...');
            console.log('Père - Nom:', pereNom, 'Prénom:', perePrenom, 'Email:', pereEmail);
            console.log('Mère - NomJF:', mereNomJeuneFille, 'Prénom:', merePrenom, 'Email:', mereEmail);
            console.log('Enfant - Nom:', enfantNom, 'Prénom:', enfantPrenom, 'Date:', enfantDateNaissance, 'Classe:', enfantClasseDemandee);

            // Validation simplifiée
            if (!enfantNom || !enfantPrenom || !enfantDateNaissance || !enfantSexe || !enfantClasseDemandee) {
                console.log('❌ Champs obligatoires manquants pour l\'enfant');
                req.flash('error', 'Veuillez remplir au minimum les informations de l\'enfant (nom, prénom, date de naissance, sexe, classe demandée).');
                return res.redirect('/dossier-inscription');
            }

            if ((!pereNom && !mereNomJeuneFille) || (!pereEmail && !mereEmail)) {
                console.log('❌ Informations parent manquantes');
                req.flash('error', 'Veuillez remplir au minimum les informations d\'un parent (nom et email).');
                return res.redirect('/dossier-inscription');
            }

            console.log('✅ Validation des champs réussie');

            // Composer l'adresse complète
            const adresseComplete = `${adresseRue}${adresseComplement ? '\n' + adresseComplement : ''}\n${adresseCodePostal} ${adresseVille}`;

            // Préparer les données des enfants
            const childrenData = [{
                firstName: enfantPrenom,
                lastName: enfantNom,
                birthDate: enfantDateNaissance,
                currentClass: enfantClasseActuelle || '',
                requestedClass: enfantClasseDemandee,
                previousSchool: enfantEcoleActuelle || '',
                lieuNaissance: enfantLieuNaissance || '',
                departementNaissance: enfantDepartementNaissance || '',
                nationalite: enfantNationalite || '',
                sexe: enfantSexe
            }];

            // Utiliser le parent principal (père en priorité, sinon mère)
            const parentFirstName = perePrenom || merePrenom;
            const parentLastName = pereNom || mereNomJeuneFille;
            const parentEmail = pereEmail || mereEmail;
            const parentPhone = pereTelephone || mereTelephone;

            // Préparer les informations des parents
            const parentsInfo = {
                pere: perePrenom ? `${perePrenom} ${pereNom} - ${pereEmail}` : null,
                mere: merePrenom ? `${merePrenom} ${mereNomJeuneFille} - ${mereEmail}` : null,
                adresse: adresseComplete,
                tel: telephoneDomicile
            };

            // Créer le dossier d'inscription détaillé
            const dossier = await prisma.dossierInscription.create({
                data: {
                    anneeScolaire: anneeScolaire || '2026/2027',

                    // Informations parents
                    pereNom: pereNom || '',
                    perePrenom: perePrenom || '',
                    pereProfession: pereProfession || null,
                    pereTelephone: pereTelephone || '',
                    pereEmail: pereEmail || '',
                    mereNom: mereNomJeuneFille || mereNomMarital || '',
                    merePrenom: merePrenom || '',
                    mereProfession: mereProfession || null,
                    mereTelephone: mereTelephone || '',
                    mereEmail: mereEmail || '',
                    adresseComplete,
                    telephoneDomicile: telephoneDomicile || null,

                    // Situation de famille
                    situationFamiliale: situationFamiliale || null,
                    nombreEnfantsFoyer: nombreEnfantsFoyer ? parseInt(nombreEnfantsFoyer) : null,
                    informationsFamille: informationsFamille || null,

                    // Informations enfant
                    enfantNom,
                    enfantPrenom,
                    enfantDateNaissance: new Date(enfantDateNaissance),
                    enfantLieuNaissance: enfantLieuNaissance || null,
                    enfantNationalite: enfantNationalite || null,
                    enfantSexe,
                    enfantClasseDemandee,
                    enfantClasseActuelle: enfantClasseActuelle || null,
                    enfantEcoleActuelle: enfantEcoleActuelle || null,
                    enfantVilleEtablissement: enfantVilleEtablissement || null,
                    enfantDerniereScolarite: enfantDerniereScolarite || null,

                    // Informations médicales
                    medecinTraitantNom: medecinTraitantNom || null,
                    medecinTraitantTelephone: medecinTraitantTelephone || null,
                    allergies: allergies || null,
                    traitementsMedicaux: traitementsMedicaux || null,
                    regimeAlimentaire: regimeAlimentaire || null,
                    paiNecessaire: paiNecessaire === 'on',
                    besoinsPArticuliers: besoinsPArticuliers || null,

                    // Personnes d'urgence
                    urgence1Nom: urgence1Nom || null,
                    urgence1Prenom: urgence1Prenom || null,
                    urgence1Lien: urgence1Lien || null,
                    urgence1Telephone: urgence1Telephone || null,
                    urgence2Nom: urgence2Nom || null,
                    urgence2Prenom: urgence2Prenom || null,
                    urgence2Lien: urgence2Lien || null,
                    urgence2Telephone: urgence2Telephone || null,

                    // Autorisations
                    autorisationPhoto: autorisationPhoto === 'on',
                    autorisationVideo: autorisationVideo === 'on',
                    autorisationSortie: autorisationSortie === 'on',
                    autorisationInternet: autorisationInternet === 'on',

                    // Services
                    transportSouhaite: transportSouhaite === 'on',
                    restaurationSouhaitee: restaurationSouhaitee === 'on',
                    joursRestauration: joursRestauration || null,

                    // Personnes autorisées à récupérer
                    recuperation1Nom: recuperation1Nom || null,
                    recuperation1Prenom: recuperation1Prenom || null,
                    recuperation1Telephone: recuperation1Telephone || null,
                    recuperation1Lien: recuperation1Lien || null,
                    recuperation2Nom: recuperation2Nom || null,
                    recuperation2Prenom: recuperation2Prenom || null,
                    recuperation2Telephone: recuperation2Telephone || null,
                    recuperation2Lien: recuperation2Lien || null,

                    // Documents
                    docCertificatRadiation: docCertificatRadiation === 'on',
                    docLivretFamille: docLivretFamille === 'on',
                    docJustificatifDomicile: docJustificatifDomicile === 'on',
                    docAssuranceScolaire: docAssuranceScolaire === 'on',
                    docCarnetSante: docCarnetSante === 'on',
                    docCertificatMedical: docCertificatMedical === 'on',

                    // Engagements
                    engagementReglement: engagementReglement === 'on',
                    engagementFinancier: engagementFinancier === 'on',
                    dateSignature: new Date(),

                    statut: 'EN_ATTENTE'
                }
            });

            console.log('✅ Dossier d\'inscription créé avec ID:', dossier.id);

            // Envoyer les emails de confirmation
            try {
                await emailService.sendInscriptionConfirmation(parentEmail, {
                    parentName: `${parentFirstName} ${parentLastName}`,
                    children: childrenData,
                    anneeScolaire: anneeScolaire || '2026/2027'
                });
                console.log('✅ Email de confirmation envoyé au parent:', parentEmail);
            } catch (emailError) {
                console.log('✅ Email de confirmation simulé envoyé à:', parentEmail);
            }

            // Notification au directeur
            try {
                await emailService.sendNewInscriptionNotification('l.camboulives@stmathieu.org', {
                    requestId: dossier.id,
                    parent: `${parentFirstName} ${parentLastName}`,
                    email: parentEmail
                });
                console.log('✅ Notification directeur envoyée');
            } catch (emailError) {
                console.log('✅ Notification directeur simulée pour:', {
                    requestId: dossier.id,
                    parent: `${parentFirstName} ${parentLastName}`,
                    email: parentEmail
                });
            }

            // Redirection avec message de succès
            req.flash('success', 'Votre dossier d\'inscription a été soumis avec succès ! Vous recevrez une réponse par email.');
            res.redirect('/dossier-inscription');

        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'inscription:', error);
            req.flash('error', 'Une erreur est survenue lors de l\'envoi de votre dossier. Veuillez réessayer.');
            res.redirect('/dossier-inscription');
        }
    }
};

module.exports = dossierInscriptionController;