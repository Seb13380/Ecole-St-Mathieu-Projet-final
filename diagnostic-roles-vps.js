const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticRoles() {
    try {
        console.log("=== DIAGNOSTIC ROLES VPS ===");
        
        // 1. Voir les utilisateurs existants et leurs rôles
        const users = await prisma.user.findMany({
            select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });
        
        console.log("\nUtilisateurs existants et leurs rôles:");
        users.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName}: ${user.role}`);
        });
        
        // 2. Tester différents rôles pour voir lesquels sont valides
        const rolesToTest = [
            'PARENT',
            'ENSEIGNANT', 
            'ADMIN',
            'DIRECTION',
            'ASSISTANT_DIRECTION',
            'APEL',
            'GESTIONNAIRE_SITE',
            'SECRETAIRE_DIRECTION',
            'RESTAURATION'
        ];
        
        console.log("\n=== TEST VALIDITE DES ROLES ===");
        
        for (const role of rolesToTest) {
            try {
                // Essayer de créer un utilisateur temporaire avec ce rôle
                const testUser = await prisma.user.create({
                    data: {
                        email: `test-${role.toLowerCase()}@temp.com`,
                        password: "temp",
                        firstName: "Test",
                        lastName: "Temp",
                        adress: "Test",
                        phone: "Test",
                        role: role
                    }
                });
                
                // Si ça marche, supprimer immédiatement
                await prisma.user.delete({
                    where: { id: testUser.id }
                });
                
                console.log(`✅ ${role} - VALIDE`);
                
            } catch (error) {
                console.log(`❌ ${role} - INVALIDE`);
            }
        }
        
    } catch (error) {
        console.error("Erreur:", error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticRoles();
