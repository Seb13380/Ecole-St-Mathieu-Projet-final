#!/bin/bash
# Script de réparation automatique sur VPS

echo "═══════════════════════════════════════════════════════"
echo "  RÉPARATION AUTOMATIQUE - VPS"
echo "═══════════════════════════════════════════════════════"
echo ""

cd /var/www/project/ecole_st_mathieu

# Créer le script de réparation
cat > /tmp/reparation-vps.js << 'EOFREP'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== REPARATION AUTOMATIQUE ===\n');
        
        let repairedCount = 0;
        
        // ÉTAPE 1: Migrer les anciennes relations
        console.log('Etape 1: Migration des anciennes relations parentId...');
        
        const studentsToMigrate = await prisma.student.findMany({
            where: {
                parentId: { not: null },
                parents: { none: {} }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                parentId: true
            }
        });
        
        console.log('Trouve ' + studentsToMigrate.length + ' relations a migrer\n');
        
        for (const student of studentsToMigrate) {
            try {
                const parentExists = await prisma.user.findUnique({
                    where: { id: student.parentId }
                });
                
                if (parentExists) {
                    await prisma.parentStudent.create({
                        data: {
                            parentId: student.parentId,
                            studentId: student.id
                        }
                    });
                    console.log('✓ Relation creee: Parent ' + student.parentId + ' -> Eleve ' + student.firstName + ' ' + student.lastName);
                    repairedCount++;
                } else {
                    console.log('⚠ Parent ' + student.parentId + ' introuvable pour ' + student.firstName);
                }
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log('i Relation deja existante pour ' + student.firstName);
                } else {
                    console.error('✗ Erreur pour ' + student.firstName + ':', error.message);
                }
            }
        }
        
        console.log('\n=== VERIFICATION FINALE ===');
        
        const finalParentsWithoutChildren = await prisma.user.count({
            where: {
                role: 'PARENT',
                enfants: { none: {} }
            }
        });
        
        const finalStudentsWithoutParents = await prisma.student.count({
            where: { parents: { none: {} } }
        });
        
        console.log('Relations reparees: ' + repairedCount);
        console.log('Parents sans enfants restants: ' + finalParentsWithoutChildren);
        console.log('Eleves sans parents restants: ' + finalStudentsWithoutParents);
        
        console.log('\n=== FIN DE LA REPARATION ===');
        
    } catch (error) {
        console.error('ERREUR:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
EOFREP

# Exécuter la réparation
echo "🔧 Exécution de la réparation..."
node /tmp/reparation-vps.js

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Réparation terminée!"
echo "═══════════════════════════════════════════════════════"
