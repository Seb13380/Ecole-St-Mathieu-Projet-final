#!/usr/bin/env node

/**
 * Script de test pour le système de tickets
 */

const { PrismaClient } = require('@prisma/client');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testTicketSystem() {
    console.log('🎫 TEST SYSTÈME DE TICKETS');
    console.log('==========================');

    try {
        // Récupérer un parent pour créer des tickets
        let parent = await prisma.user.findFirst({
            where: { role: 'PARENT' }
        });

        if (!parent) {
            console.log('   ⚠️ Création d\'un parent de test...');
            parent = await prisma.user.create({
                data: {
                    firstName: 'Parent',
                    lastName: 'TestTicket',
                    email: 'parent.ticket@exemple.com',
                    password: '$2b$12$test.hash',
                    role: 'PARENT',
                    phone: '06.99.99.99.99'
                }
            });
        }

        console.log(`   ✅ Parent trouvé: ${parent.firstName} ${parent.lastName}`);

        // Test 1: Créer un ticket technique
        console.log('\n1️⃣ Création ticket technique...');

        const ticketTechnique = await prisma.ticket.create({
            data: {
                objet: 'Problème de connexion',
                message: 'Je n\'arrive pas à me connecter à mon compte parent. Le message d\'erreur indique "identifiants invalides" mais je suis sûr de mon mot de passe.',
                type: 'TECHNIQUE',
                priorite: 'MOYENNE',
                status: 'OUVERT',
                userId: parent.id
            }
        });

        console.log(`   ✅ Ticket technique créé: ${ticketTechnique.objet}`);
        console.log(`   🎯 ID: ${ticketTechnique.id}`);

        // Test 2: Créer un ticket administratif
        console.log('\n2️⃣ Création ticket administratif...');

        const ticketAdmin = await prisma.ticket.create({
            data: {
                objet: 'Demande certificat de scolarité',
                message: 'Bonjour, je souhaiterais obtenir un certificat de scolarité pour mon enfant Emma Martin en CP pour une demande de logement.',
                type: 'ADMINISTRATIF',
                priorite: 'BASSE',
                status: 'OUVERT',
                userId: parent.id
            }
        });

        console.log(`   ✅ Ticket administratif créé: ${ticketAdmin.objet}`);
        console.log(`   🎯 ID: ${ticketAdmin.id}`);

        // Test 3: Créer un ticket urgent
        console.log('\n3️⃣ Création ticket urgent...');

        const ticketUrgent = await prisma.ticket.create({
            data: {
                objet: 'Enfant malade - absence',
                message: 'Mon enfant Thomas Martin est malade aujourd\'hui et ne pourra pas venir à l\'école. Merci de bien vouloir excuser son absence.',
                type: 'GENERAL',
                priorite: 'HAUTE',
                status: 'OUVERT',
                userId: parent.id
            }
        });

        console.log(`   ✅ Ticket urgent créé: ${ticketUrgent.objet}`);
        console.log(`   🎯 ID: ${ticketUrgent.id}`);

        // Test 4: Ajouter des réponses
        console.log('\n4️⃣ Ajout de réponses...');

        const reponse1 = await prisma.reponseTicket.create({
            data: {
                message: 'Bonjour, nous avons bien reçu votre demande. Nous allons réinitialiser votre mot de passe et vous envoyer les nouveaux identifiants par email.',
                ticketId: ticketTechnique.id,
                userId: parent.id, // En attendant d'avoir un admin
                isFromAdmin: true
            }
        });

        console.log(`   ✅ Réponse ajoutée au ticket technique`);

        const reponse2 = await prisma.reponseTicket.create({
            data: {
                message: 'Le certificat de scolarité sera prêt sous 48h. Vous pourrez le récupérer au secrétariat.',
                ticketId: ticketAdmin.id,
                userId: parent.id,
                isFromAdmin: true
            }
        });

        console.log(`   ✅ Réponse ajoutée au ticket administratif`);

        // Test 5: Mettre à jour le statut
        console.log('\n5️⃣ Mise à jour des statuts...');

        await prisma.ticket.update({
            where: { id: ticketTechnique.id },
            data: { status: 'EN_COURS' }
        });

        await prisma.ticket.update({
            where: { id: ticketAdmin.id },
            data: { status: 'RESOLU' }
        });

        console.log(`   ✅ Statuts mis à jour`);

        // Test 6: Récupérer tous les tickets avec leurs réponses
        console.log('\n6️⃣ Récupération tickets avec réponses...');

        const ticketsAvecReponses = await prisma.ticket.findMany({
            where: { userId: parent.id },
            include: {
                user: true,
                reponses: {
                    include: {
                        user: true
                    },
                    orderBy: { dateCreation: 'asc' }
                }
            },
            orderBy: { dateCreation: 'desc' }
        });

        console.log(`   ✅ ${ticketsAvecReponses.length} tickets trouvés`);

        ticketsAvecReponses.forEach((ticket, index) => {
            console.log(`   ${index + 1}. ${ticket.objet} - ${ticket.status} - ${ticket.reponses.length} réponse(s)`);
        });

        // Test 7: Statistiques
        console.log('\n7️⃣ Statistiques des tickets...');

        const stats = await prisma.ticket.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('   📊 Répartition par statut:');
        stats.forEach(stat => {
            console.log(`   - ${stat.status}: ${stat._count} tickets`);
        });

        const statsPriorite = await prisma.ticket.groupBy({
            by: ['priorite'],
            _count: true
        });

        console.log('   📊 Répartition par priorité:');
        statsPriorite.forEach(stat => {
            console.log(`   - ${stat.priorite}: ${stat._count} tickets`);
        });

        console.log('\n✅ TESTS TICKETS TERMINÉS AVEC SUCCÈS !');

    } catch (error) {
        console.error('\n❌ ERREUR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
if (require.main === module) {
    testTicketSystem().catch(console.error);
}

module.exports = { testTicketSystem };
