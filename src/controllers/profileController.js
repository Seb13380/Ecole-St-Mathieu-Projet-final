const express = require('express');

const ProfileController = {
    /**
     * Affiche le profil de l'utilisateur connecté
     */
    async showProfile(req, res) {
        try {
            const user = req.session.user;

            if (!user) {
                return res.redirect('/auth/login?message=Vous devez être connecté pour voir votre profil');
            }

            // Données de profil étendues selon le rôle
            let profileData = {
                ...user,
                lastLogin: new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                }),
                memberSince: '2023', // Exemple
                profileImage: this.getProfileImage(user.role)
            };

            // Ajouter des données spécifiques selon le rôle
            if (user.role === 'PARENT') {
                profileData.children = [
                    {
                        id: 1,
                        firstName: 'Paul',
                        lastName: 'Cecchini',
                        classe: { nom: 'CP-A' },
                        age: 6,
                        ticketsRemaining: 15
                    },
                    {
                        id: 2,
                        firstName: 'Marie',
                        lastName: 'Cecchini',
                        classe: { nom: 'CE2-B' },
                        age: 8,
                        ticketsRemaining: 12
                    }
                ];
                profileData.totalTickets = profileData.children.reduce((sum, child) => sum + child.ticketsRemaining, 0);
                profileData.accountBalance = 125.50; // Exemple
            } else if (user.role === 'RESTAURANT') {
                profileData.workingHours = {
                    start: '08:00',
                    end: '16:00'
                };
                profileData.todayServed = 45;
                profileData.weeklyAverage = 52;
            }

            res.render('pages/profile/index.twig', {
                pageTitle: 'Mon Profil',
                user: profileData,
                canEdit: true
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du profil:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du profil'
            });
        }
    },

    /**
     * Affiche le formulaire d'édition du profil
     */
    async editProfile(req, res) {
        try {
            const user = req.session.user;

            if (!user) {
                return res.redirect('/auth/login?message=Vous devez être connecté');
            }

            res.render('pages/profile/edit.twig', {
                pageTitle: 'Modifier mon profil',
                user
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire d\'édition:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du formulaire'
            });
        }
    },

    /**
     * Met à jour le profil de l'utilisateur
     */
    async updateProfile(req, res) {
        try {
            const user = req.session.user;
            const { firstName, lastName, email, phone, address, notifications } = req.body;

            if (!user) {
                return res.redirect('/auth/login');
            }

            // Dans un vrai projet, on mettrait à jour la base de données :
            // const updatedUser = await prisma.user.update({
            //     where: { id: user.id },
            //     data: {
            //         firstName,
            //         lastName,
            //         email,
            //         phone,
            //         address,
            //         notifications: notifications === 'on'
            //     }
            // });

            // Pour la démonstration, on met à jour la session
            req.session.user = {
                ...user,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                email: email || user.email,
                phone: phone || user.phone,
                address: address || user.address,
                notifications: notifications === 'on'
            };

            console.log(`✅ Profil mis à jour pour: ${user.email}`);

            res.redirect('/profile?success=Profil mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.redirect('/profile/edit?error=Erreur lors de la mise à jour');
        }
    },

    /**
     * Affiche la page de changement de mot de passe
     */
    async changePasswordForm(req, res) {
        try {
            const user = req.session.user;

            if (!user) {
                return res.redirect('/auth/login');
            }

            res.render('pages/profile/change-password.twig', {
                pageTitle: 'Changer le mot de passe',
                user
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire de mot de passe:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du formulaire'
            });
        }
    },

    /**
     * Change le mot de passe de l'utilisateur
     */
    async changePassword(req, res) {
        try {
            const user = req.session.user;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!user) {
                return res.redirect('/auth/login');
            }

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.redirect('/profile/change-password?error=Tous les champs sont requis');
            }

            if (newPassword !== confirmPassword) {
                return res.redirect('/profile/change-password?error=Les nouveaux mots de passe ne correspondent pas');
            }

            if (newPassword.length < 6) {
                return res.redirect('/profile/change-password?error=Le mot de passe doit contenir au moins 6 caractères');
            }

            // Dans un vrai projet, on vérifierait le mot de passe actuel et on mettrait à jour
            // const bcrypt = require('bcrypt');
            // const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            // if (!isValidPassword) {
            //     return res.redirect('/profile/change-password?error=Mot de passe actuel incorrect');
            // }
            // const hashedPassword = await bcrypt.hash(newPassword, 10);
            // await prisma.user.update({
            //     where: { id: user.id },
            //     data: { password: hashedPassword }
            // });

            console.log(`✅ Mot de passe changé pour: ${user.email}`);

            res.redirect('/profile?success=Mot de passe changé avec succès');
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            res.redirect('/profile/change-password?error=Erreur lors du changement de mot de passe');
        }
    },

    /**
     * Retourne l'image de profil par défaut selon le rôle
     */
    getProfileImage(role) {
        const images = {
            'PARENT': '👨‍👩‍👧‍👦',
            'RESTAURANT': '👨‍🍳',
            'ADMIN': '👨‍💼',
            'DIRECTION': '🎯',
            'ENSEIGNANT': '👨‍🏫'
        };
        return images[role] || '👤';
    }
};

module.exports = ProfileController;
