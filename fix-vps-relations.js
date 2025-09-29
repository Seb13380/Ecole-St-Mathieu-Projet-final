#!/usr/bin/env node

/**
 * Script pour corriger les relations parent-enfant sur le VPS
 * À exécuter uniquement sur le serveur VPS
 */

const fs = require('fs');
const path = require('path');

const controllerPath = './src/controllers/userManagementController.js';

console.log('🔧 Correction des relations pour le VPS...');

// Lire le fichier
let content = fs.readFileSync(controllerPath, 'utf8');

// Remplacer la requête des parents
const oldParentsQuery = `            const parents = await prisma.user.findMany({
                where: { role: 'PARENT' },
                include: {
                    students: {  // Relation directe via parentId
                        select: {
                            firstName: true,
                            lastName: true,
                            classe: { select: { nom: true } }
                        }
                    },
                    _count: {
                        select: { enfants: true }  // Compter les enfants via la table de jonction
                    }
                },
                orderBy: { createdAt: 'desc' }
            });`;

const newParentsQuery = `            const parents = await prisma.user.findMany({
                where: { role: 'PARENT' },
                include: {
                    students: {  // Relation directe via parentId
                        select: {
                            firstName: true,
                            lastName: true,
                            classe: { select: { nom: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });`;

// Remplacer la requête des étudiants
const oldStudentsQuery = `                prisma.student.findMany({
                    include: {
                        parent: {
                            select: { firstName: true, lastName: true, email: true }
                        },
                        parents: {  // Relation via table de jonction ParentStudent
                            include: {
                                parent: {
                                    select: { firstName: true, lastName: true, email: true }
                                }
                            }
                        },
                        classe: {
                            select: { nom: true, niveau: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),`;

const newStudentsQuery = `                prisma.student.findMany({
                    include: {
                        parent: {
                            select: { firstName: true, lastName: true, email: true }
                        },
                        classe: {
                            select: { nom: true, niveau: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),`;

// Appliquer les remplacements
content = content.replace(oldParentsQuery, newParentsQuery);
content = content.replace(oldStudentsQuery, newStudentsQuery);

// Sauvegarder
fs.writeFileSync(controllerPath, content);

console.log('✅ Corrections appliquées pour le VPS');
console.log('📋 Les relations utilisent maintenant seulement les relations directes');
console.log('🔄 Redémarrez PM2 avec: pm2 restart ecole');