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

            // Récupérer les années scolaires ouvertes aux inscriptions
            const anneesInscription = await prisma.anneeScolaireInscription.findMany({
                where: { ouverte: true },
                orderBy: { ordre: 'asc' }
            });

            res.render('pages/dossier-inscription', {
                title: 'Dossier d\'inscription - École Saint-Mathieu',
                user: req.session.user || null,
                currentUrl: req.originalUrl,
                success: req.flash('success'),
                error: req.flash('error'),
                documentsRequis,
                anneesInscription
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

            // Validation simplifiée
            if (!enfantNom || !enfantPrenom || !enfantDateNaissance || !enfantSexe || !enfantClasseDemandee) {
                req.flash('error', 'Veuillez remplir au minimum les informations de l\'enfant (nom, prénom, date de naissance, sexe, classe demandée).');
                return res.redirect('/dossier-inscription');
            }

            if ((!pereNom && !mereNomJeuneFille) || (!pereEmail && !mereEmail)) {
                req.flash('error', 'Veuillez remplir au minimum les informations d\'un parent (nom et email).');
                return res.redirect('/dossier-inscription');
            }


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


            // 📧 ENVOI EMAIL CONFIRMATION PARENT
            try {
                const parentConfirmationData = {
                    parentEmail: parentEmail,
                    parentFirstName: parentFirstName,
                    children: [{
                        firstName: data.enfantPrenom,
                        lastName: data.enfantNom,
                        birthDate: data.enfantDateNaissance,
                        requestedClass: data.enfantClasseDemandee
                    }]
                };

                const parentEmailResult = await emailService.sendInscriptionConfirmation(parentConfirmationData);

                if (parentEmailResult.success) {
                } else {
                    console.error('❌ Erreur email parent:', parentEmailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email parent:', emailError);
                // Ne pas faire échouer l'inscription si l'email échoue
            }

            // 🔥 ENVOI EMAIL NOTIFICATION ADMIN
            try {
                const adminEmailData = {
                    requestId: dossier.id,
                    parentName: `${parentFirstName} ${parentLastName}`,
                    parentEmail: parentEmail,
                    parentPhone: pereTelephone || mereTelephone,
                    parentAddress: adresseComplete,
                    children: [{
                        firstName: data.enfantPrenom,
                        lastName: data.enfantNom,
                        birthDate: data.enfantDateNaissance,
                        requestedClass: data.enfantClasseDemandee
                    }],
                    submittedAt: new Date(),
                    adminEmail: 'sgdigitalweb13@gmail.com'
                };

                const emailResult = await emailService.sendNewInscriptionNotification(adminEmailData);

                if (emailResult.success) {
                } else {
                    console.error('❌ Erreur email admin:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email admin:', emailError);
                // Ne pas faire échouer l'inscription si l'email échoue
            }

            // Redirection avec message de succès
            req.flash('success', 'Votre demande d\'inscription a été soumise avec succès ! Nous vous remercions pour l\'intérêt porté à notre établissement. Celle-ci n\'est qu\'une étape préalable avant l\'attribution d\'un rendez-vous avec le chef d\'établissement qui sera proposé selon l\'évolution de nos effectifs. Vous recevrez un email de confirmation.');
            res.redirect('/dossier-inscription');

        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'inscription:', error);
            req.flash('error', 'Une erreur est survenue lors de l\'envoi de votre dossier. Veuillez réessayer.');
            res.redirect('/dossier-inscription');
        }
    }
};

module.exports = dossierInscriptionController;