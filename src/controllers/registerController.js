const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const registerController = {
    // Afficher le formulaire d'inscription
    async showRegisterForm(req, res) {
        try {
            console.log('📝 Affichage du formulaire d\'inscription');
            res.render('pages/auth/register.twig', {
                title: 'Inscription - École Saint-Mathieu'
            });
        } catch (error) {
            console.error('❌ Erreur affichage formulaire inscription:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors de l\'affichage du formulaire d\'inscription'
            });
        }
    },

    // Traiter l'inscription
    async processRegister(req, res) {
        try {
            console.log('📝 Tentative d\'inscription pour:', req.body.email);
            const { firstName, lastName, email, password, confirmPassword, phone, adress, invitationCode } = req.body;

            // Validation des mots de passe
            if (password !== confirmPassword) {
                console.log('❌ Mots de passe différents');
                return res.render('pages/auth/register.twig', {
                    error: 'Les mots de passe ne correspondent pas',
                    formData: req.body,
                    title: 'Inscription - École Saint-Mathieu'
                });
            }

            // Validation de la complexité du mot de passe
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordRegex.test(password)) {
                console.log('❌ Mot de passe non conforme');
                return res.render('pages/auth/register.twig', {
                    error: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)',
                    formData: req.body,
                    title: 'Inscription - École Saint-Mathieu'
                });
            }

            // Vérification si l'email existe déjà
            console.log('🔍 Vérification unicité de l\'email...');
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                console.log('❌ Email déjà utilisé:', email);
                return res.render('pages/auth/register.twig', {
                    error: 'Un compte avec cet email existe déjà',
                    formData: req.body,
                    title: 'Inscription - École Saint-Mathieu'
                });
            }

            // Déterminer le rôle (pour l'instant PARENT par défaut)
            let userRole = 'PARENT';

            // TODO: Implémenter le système d'invitation plus tard
            if (invitationCode) {
                console.log('⚠️ Code d\'invitation fourni mais non traité pour le moment:', invitationCode);
                // Pour l'instant, on ignore le code d'invitation
            }

            // Hachage du mot de passe
            console.log('🔐 Hachage du mot de passe...');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Création de l'utilisateur
            console.log('👤 Création de l\'utilisateur...');
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    phone,
                    adress,
                    role: userRole
                }
            });

            console.log('✅ Utilisateur créé avec succès:', user.email, 'ID:', user.id);

            // Succès - retour au formulaire avec message de succès
            res.render('pages/auth/register.twig', {
                success: `Inscription réussie en tant que ${userRole} ! Vous pouvez maintenant vous connecter.`,
                title: 'Inscription - École Saint-Mathieu'
            });

        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            res.render('pages/auth/register.twig', {
                error: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.',
                formData: req.body,
                title: 'Inscription - École Saint-Mathieu'
            });
        }
    }
};

module.exports = registerController;
