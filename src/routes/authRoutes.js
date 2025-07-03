const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Page d'inscription
router.get('/register', (req, res) => {
    res.render('./pages/auth/register.twig');
});

// Traitement de l'inscription
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phone, adress } = req.body;
        
        // Validation côté serveur
        
        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            return res.render('./pages/auth/register.twig', {
                error: 'Les mots de passe ne correspondent pas',
                formData: req.body
            });
        }
        
        // Vérifier la complexité du mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.render('./pages/auth/register.twig', {
                error: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)',
                formData: req.body
            });
        }
        
        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.render('./pages/auth/register.twig', {
                error: 'Un compte avec cet email existe déjà',
                formData: req.body
            });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                adress,
                role: 'PARENT' // Par défaut, les inscriptions sont des parents
            }
        });
        
        res.render('./pages/auth/register.twig', {
            success: 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
        });
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.render('./pages/auth/register.twig', {
            error: 'Une erreur est survenue lors de l\'inscription',
            formData: req.body
        });
    }
});

// Page de connexion
router.get('/login', (req, res) => {
    res.render('./pages/auth/login.twig');
});

// Traitement de la connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            return res.render('./pages/auth/login.twig', {
                error: 'Email ou mot de passe incorrect',
                email
            });
        }
        
        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.render('./pages/auth/login.twig', {
                error: 'Email ou mot de passe incorrect',
                email
            });
        }
        
        // Créer la session
        req.session.user = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };
        
        // Rediriger selon le rôle
        switch (user.role) {
            case 'ADMIN':
            case 'DIRECTION':
                res.redirect('/admin/dashboard');
                break;
            case 'ENSEIGNANT':
                res.redirect('/enseignant/dashboard');
                break;
            case 'PARENT':
                res.redirect('/parent/dashboard');
                break;
            default:
                res.redirect('/');
        }
        
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.render('./pages/auth/login.twig', {
            error: 'Une erreur est survenue lors de la connexion'
        });
    }
});

// Déconnexion
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur déconnexion:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
