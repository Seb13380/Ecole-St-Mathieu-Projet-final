const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const invitationController = {
    async generateCode(req, res) {
        try {
            const { role, validiteJours } = req.body;

            if (req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const rolesAutorises = ['APEL', 'ENSEIGNANT', 'DIRECTION'];
            if (!rolesAutorises.includes(role)) {
                return res.status(400).json({ error: 'Rôle non autorisé' });
            }

            const code = crypto.randomBytes(8).toString('hex').toUpperCase();

            const valideJusqu = validiteJours ?
                new Date(Date.now() + validiteJours * 24 * 60 * 60 * 1000) :
                null;

            const invitation = await prisma.invitationCode.create({
                data: {
                    code,
                    role,
                    valideJusqu,
                    createdBy: req.session.user.id
                }
            });

            res.json({
                success: true,
                code: invitation.code,
                role: invitation.role,
                valideJusqu: invitation.valideJusqu
            });

        } catch (error) {
            console.error('Erreur génération code:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    async verifyCode(code) {
        try {
            const invitation = await prisma.invitationCode.findUnique({
                where: { code }
            });

            if (!invitation) {
                return { valid: false, error: 'Code invalide' };
            }

            if (invitation.utilise) {
                return { valid: false, error: 'Code déjà utilisé' };
            }

            if (invitation.valideJusqu && invitation.valideJusqu < new Date()) {
                return { valid: false, error: 'Code expiré' };
            }

            return { valid: true, role: invitation.role };

        } catch (error) {
            console.error('Erreur vérification code:', error);
            return { valid: false, error: 'Erreur serveur' };
        }
    },

    async useCode(code, email) {
        try {
            await prisma.invitationCode.update({
                where: { code },
                data: {
                    utilise: true,
                    utilisePar: email,
                    usedAt: new Date()
                }
            });
        } catch (error) {
            console.error('Erreur utilisation code:', error);
        }
    },

    async listCodes(req, res) {
        try {
            if (req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const codes = await prisma.invitationCode.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    code: true,
                    role: true,
                    utilise: true,
                    utilisePar: true,
                    valideJusqu: true,
                    createdAt: true,
                    usedAt: true
                }
            });

            res.json(codes);

        } catch (error) {
            console.error('Erreur liste codes:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

module.exports = invitationController;
