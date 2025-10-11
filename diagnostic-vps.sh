#!/bin/bash
# Script de diagnostic et réparation sur VPS

echo "═══════════════════════════════════════════════════════"
echo "  DIAGNOSTIC ET RÉPARATION - VPS"
echo "═══════════════════════════════════════════════════════"
echo ""

cd /var/www/project/ecole_st_mathieu

# 1. Créer le script de diagnostic
cat > /tmp/diagnostic-vps.js << 'EOFDIAG'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== DIAGNOSTIC VPS ===\n');
        
        const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
        const totalStudents = await prisma.student.count();
        const totalRelations = await prisma.parentStudent.count();
        
        console.log('Total parents: ' + totalParents);
        console.log('Total eleves: ' + totalStudents);
        console.log('Total relations: ' + totalRelations);
        
        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                enfants: { none: {} }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });
        
        console.log('\nParents SANS enfants: ' + parentsWithoutChildren.length);
        
        if (parentsWithoutChildren.length > 0) {
            console.log('\nListe:');
            parentsWithoutChildren.forEach(function(p) {
                console.log('- ' + p.firstName + ' ' + p.lastName + ' (' + p.email + ')');
            });
        }
        
        const studentsWithoutParents = await prisma.student.count({
            where: { parents: { none: {} } }
        });
        
        console.log('\nEleves SANS parents: ' + studentsWithoutParents);
        
        const studentsWithOldParentId = await prisma.student.count({
            where: {
                parentId: { not: null },
                parents: { none: {} }
            }
        });
        
        console.log('Eleves avec ancien parentId a migrer: ' + studentsWithOldParentId);
        
    } catch (error) {
        console.error('ERREUR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
EOFDIAG

# 2. Exécuter le diagnostic
echo "📋 Exécution du diagnostic..."
node /tmp/diagnostic-vps.js

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Diagnostic terminé!"
echo "═══════════════════════════════════════════════════════"
