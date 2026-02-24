const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

// === REDIRECTIONS VERS LES ROUTES DIRECTEUR ===
// Toutes les fonctionnalités admin sont maintenant dans directeur

// Dashboard admin -> directeur
router.get('/dashboard', requireAdmin, (req, res) => {
    res.redirect('/directeur/dashboard');
});

// Gestion des utilisateurs -> directeur
router.get('/users', requireAdmin, (req, res) => {
    res.redirect('/directeur/users');
});

router.post('/users', requireAdmin, (req, res) => {
    req.url = '/directeur/users';
    req.baseUrl = '/directeur';
    res.redirect(307, '/directeur/users');
});

router.post('/users/:id/update', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/users/${id}/update`);
});

router.post('/users/:id/delete', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/users/${id}/delete`);
});

// Gestion des classes -> directeur
router.get('/classes', requireAdmin, (req, res) => {
    res.redirect('/directeur/classes');
});

router.post('/classes', requireAdmin, (req, res) => {
    res.redirect(307, '/directeur/classes');
});

router.post('/classes/:id/update', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/classes/${id}/update`);
});

router.post('/classes/:id/delete', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/classes/${id}/delete`);
});

// Gestion des élèves -> directeur
router.get('/students', requireAdmin, (req, res) => {
    res.redirect('/directeur/students');
});

router.post('/students', requireAdmin, (req, res) => {
    res.redirect(307, '/directeur/students');
});

router.post('/students/:id/update', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/students/${id}/update`);
});

router.post('/students/:id/delete', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/students/${id}/delete`);
});

// Routes pour les demandes d'inscription -> directeur
router.get('/inscriptions', requireAdmin, (req, res) => {
    res.redirect('/directeur/inscriptions');
});

router.get('/inscriptions/manage', requireAdmin, (req, res) => {
    res.redirect('/directeur/inscriptions/manage');
});

router.post('/inscriptions/:id/approve', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/inscriptions/${id}/approve`);
});

router.post('/inscriptions/:id/reject', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/inscriptions/${id}/reject`);
});

router.get('/inscriptions/:id/details', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(`/directeur/inscriptions/${id}/details`);
});

// API routes
router.get('/api/classes', requireAdmin, (req, res) => {
    res.redirect('/directeur/api/classes');
});

router.post('/notify-yamina', requireAdmin, (req, res) => {
    res.redirect(307, '/directeur/notify-yamina');
});

// Messages de contact -> directeur
router.get('/contact-messages', requireAdmin, (req, res) => {
    res.redirect('/directeur/contact-messages');
});

router.post('/contact/:id/process', requireAdmin, (req, res) => {
    const { id } = req.params;
    res.redirect(307, `/directeur/contact/${id}/process`);
});

// Rapports et statistiques -> directeur
router.get('/reports', requireAdmin, (req, res) => {
    res.redirect('/directeur/reports');
});

// Paramètres système -> directeur
router.get('/settings', requireAdmin, (req, res) => {
    res.redirect('/directeur/settings');
});

router.post('/settings', requireAdmin, (req, res) => {
    res.redirect(307, '/directeur/settings');
});

module.exports = router;
