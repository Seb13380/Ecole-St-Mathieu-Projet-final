/**
 * 🔧 PATCH TEMPORAIRE POUR DIAGNOSTIC ROUTE REJECT
 */

const fs = require('fs');

function addDebugLogging() {
    console.log('🔧 AJOUT LOGGING TEMPORAIRE ROUTE REJECT');
    console.log('='.repeat(50));

    try {
        // Lire le contrôleur actuel
        const controllerPath = 'src/controllers/inscriptionController.js';
        let controller = fs.readFileSync(controllerPath, 'utf8');

        // Trouver la fonction rejectRequest et ajouter des logs
        const originalFunction = controller.match(/(rejectRequest: async \(req, res\) => {[\s\S]*?^    },)/m);
        
        if (originalFunction) {
            const newFunction = `rejectRequest: async (req, res) => {
        console.log('🔍 REJECT REQUEST APPELÉ - ID:', req.params.id);
        console.log('🔍 REJECT REQUEST BODY:', req.body);
        console.log('🔍 REJECT REQUEST USER:', req.session.user);
        
        try {
            const { id } = req.params;
            const { reason } = req.body;

            console.log('🔍 PARSING ID:', id, 'REASON:', reason);

            if (!reason) {
                console.log('❌ REJECT: Pas de reason');
                return res.status(400).json({
                    success: false,
                    message: 'Le motif du refus est obligatoire'
                });
            }

            // Récupérer la demande
            console.log('🔍 RECHERCHE DEMANDE ID:', parseInt(id));
            const request = await prisma.preInscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            console.log('🔍 DEMANDE TROUVÉE:', request ? 'OUI' : 'NON');
            if (!request) {
                console.log('❌ REJECT: Demande non trouvée pour ID:', parseInt(id));
                return res.status(404).json({
                    success: false,
                    message: 'Demande non trouvée'
                });
            }

            // Mettre à jour le statut
            console.log('🔍 MISE À JOUR STATUT...');
            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    processedAt: new Date(),
                    processedBy: req.session.user.id,
                    adminNotes: reason
                }
            });

            console.log('✅ REJECT: Succès pour ID:', parseInt(id));
            res.json({
                success: true,
                message: 'Demande refusée et email envoyé'
            });

        } catch (error) {
            console.error('❌ REJECT ERROR:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du refus: ' + error.message
            });
        }
    },`;

            // Remplacer la fonction
            controller = controller.replace(originalFunction[0], newFunction);
            
            // Écrire le fichier modifié
            fs.writeFileSync(controllerPath + '.debug', controller);
            
            console.log('✅ Version debug créée:', controllerPath + '.debug');
            console.log('');
            console.log('🔧 POUR APPLIQUER LE PATCH:');
            console.log('1. cp src/controllers/inscriptionController.js src/controllers/inscriptionController.js.backup');
            console.log('2. cp src/controllers/inscriptionController.js.debug src/controllers/inscriptionController.js');
            console.log('3. pm2 restart all');
            console.log('4. Tentez un rejet et regardez pm2 logs');
            console.log('');
            console.log('🔄 POUR RESTAURER:');
            console.log('cp src/controllers/inscriptionController.js.backup src/controllers/inscriptionController.js');
            console.log('pm2 restart all');
            
        } else {
            console.log('❌ Fonction rejectRequest non trouvée');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

addDebugLogging();