const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getHome = async (req, res) => {
    res.render("./pages/home.twig");
};

