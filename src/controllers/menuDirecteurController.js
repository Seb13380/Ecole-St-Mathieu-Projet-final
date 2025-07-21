const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const menuDirecteurController = {
    // Rediriger vers la gestion des menus PDF
    async gestionMenus(req, res) {
        // Rediriger vers le nouveau système de gestion des menus PDF
        res.redirect('/admin/menus-pdf');
    }
};

module.exports = { menuDirecteurController };
