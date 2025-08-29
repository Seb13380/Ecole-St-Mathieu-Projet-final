const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createOrUpdateVPSUsers() {
    try {
        console.log("=== CREATION/MISE A JOUR UTILISATEURS VPS ===");

        const lionelHash = await bcrypt.hash("Lionel123!", 10);
        const frankHash = await bcrypt.hash("Frank123!", 10);

        // 1. Vérifier/Créer/Mettre à jour Lionel
        let lionel = await prisma.user.findFirst({
            where: { 
                OR: [
                    { email: "l.camboulives@stmathieu.org" },
                    { firstName: { contains: "Lionel" } }
                ]
            }
        });

        if (lionel) {
            await prisma.user.update({
                where: { id: lionel.id },
                data: {
                    email: "l.camboulives@stmathieu.org",
                    password: lionelHash,
                    firstName: "Lionel",
                    lastName: "Camboulives",
                    role: "DIRECTION"
                }
            });
            console.log("✅ Lionel mis à jour");
        } else {
            lionel = await prisma.user.create({
                data: {
                    email: "l.camboulives@stmathieu.org",
                    password: lionelHash,
                    firstName: "Lionel",
                    lastName: "Camboulives",
                    adress: "Ecole St Mathieu",
                    phone: "04 91 XX XX XX",
                    role: "DIRECTION"
                }
            });
            console.log("✅ Lionel créé");
        }

        // 2. Vérifier/Créer/Mettre à jour Frank
        let frank = await prisma.user.findFirst({
            where: { 
                OR: [
                    { email: "frank.quaracino@orange.fr" },
                    { firstName: { contains: "Frank" } }
                ]
            }
        });

        if (frank) {
            await prisma.user.update({
                where: { id: frank.id },
                data: {
                    email: "frank.quaracino@orange.fr",
                    password: frankHash,
                    firstName: "Frank",
                    lastName: "Quaracino",
                    role: "GESTIONNAIRE_SITE"
                }
            });
            console.log("✅ Frank mis à jour");
        } else {
            frank = await prisma.user.create({
                data: {
                    email: "frank.quaracino@orange.fr",
                    password: frankHash,
                    firstName: "Frank",
                    lastName: "Quaracino",
                    adress: "Marseille",
                    phone: "06 XX XX XX XX",
                    role: "GESTIONNAIRE_SITE"
                }
            });
            console.log("✅ Frank créé");
        }

        // 3. Vérification finale
        console.log("\n=== VERIFICATION FINALE ===");
        
        const finalLionel = await prisma.user.findUnique({
            where: { email: "l.camboulives@stmathieu.org" }
        });
        
        const finalFrank = await prisma.user.findUnique({
            where: { email: "frank.quaracino@orange.fr" }
        });

        console.log("Lionel:", finalLionel ? "✅ OK" : "❌ PROBLEME");
        console.log("Frank:", finalFrank ? "✅ OK" : "❌ PROBLEME");

        console.log("\n🎉 Terminé !");
        console.log("Lionel: l.camboulives@stmathieu.org / Lionel123!");
        console.log("Frank: frank.quaracino@orange.fr / Frank123!");

    } catch (error) {
        console.error("Erreur:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createOrUpdateVPSUsers();
