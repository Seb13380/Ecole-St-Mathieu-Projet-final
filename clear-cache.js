// Script pour nettoyer le cache de Node.js
console.log('🧹 Nettoyage du cache Node.js...');

// Supprimer tous les modules du cache
Object.keys(require.cache).forEach(function (key) {
    delete require.cache[key];
});

console.log('✅ Cache nettoyé !');
console.log('🔄 Redémarrage recommandé...');
