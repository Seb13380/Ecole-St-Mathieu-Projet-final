// Debug des permissions de Yamina
const express = require('express');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugYaminaPermissions() {
    console.log('🔍 Debug des permissions de Yamina');
    console.log('='.repeat(50));

    try {
        // 1. Vérifier Yamina dans la DB
        const yamina = await prisma.user.findUnique({
            where: { email: 'ecole-saint-mathieu@wanadoo.fr' }
        });

        if (!yamina) {
            console.log('❌ Yamina non trouvée dans la DB');
            return;
        }

        console.log('👤 Yamina trouvée:');
        console.log(`   - ID: ${yamina.id}`);
        console.log(`   - Email: ${yamina.email}`);
        console.log(`   - Nom: ${yamina.firstName} ${yamina.lastName}`);
        console.log(`   - Rôle: ${yamina.role}`);
        console.log(`   - Créé: ${yamina.createdAt}`);

        // 2. Tester les middlewares
        console.log('\n🔧 Test des middlewares:');

        const { requireAuth, requireRole, requireAdmin } = require('./src/middleware/auth');

        // Simuler une session
        const mockReq = {
            session: {
                user: yamina
            }
        };

        const mockRes = {
            status: (code) => ({
                json: (data) => console.log(`   ❌ Réponse ${code}:`, data),
                render: (template, data) => console.log(`   ❌ Render ${code}:`, template, data.message)
            }),
            redirect: (url) => console.log(`   ❌ Redirect:`, url)
        };

        const mockNext = () => console.log('   ✅ Next() appelé - middleware OK');

        // Test requireAuth
        console.log('\n   🔐 Test requireAuth:');
        try {
            requireAuth(mockReq, mockRes, mockNext);
        } catch (e) {
            console.log('   ❌ Erreur requireAuth:', e.message);
        }

        // Test requireRole avec DIRECTION
        console.log('\n   🎭 Test requireRole(DIRECTION):');
        try {
            const roleMiddleware = requireRole(['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE', 'SECRETAIRE_DIRECTION']);
            roleMiddleware(mockReq, mockRes, mockNext);
        } catch (e) {
            console.log('   ❌ Erreur requireRole:', e.message);
        }

        // Test requireAdmin
        console.log('\n   👑 Test requireAdmin:');
        try {
            requireAdmin(mockReq, mockRes, mockNext);
        } catch (e) {
            console.log('   ❌ Erreur requireAdmin:', e.message);
        }

        console.log('\n🌐 URLs à tester manuellement:');
        console.log('   - Dashboard: http://localhost:3007/secretaire/dashboard');
        console.log('   - Rendez-vous: http://localhost:3007/directeur/rendez-vous-inscriptions');
        console.log('   - Inscriptions: http://localhost:3007/directeur/inscriptions');

        console.log('\n⚠️  Si les middlewares passent mais que l\'accès est refusé,');
        console.log('     redémarrez le serveur avec: npm start');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

debugYaminaPermissions()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });