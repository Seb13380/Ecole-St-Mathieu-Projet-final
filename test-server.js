// Test simple du serveur
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('<h1>Test serveur OK</h1>');
});

const PORT = 3008;
app.listen(PORT, () => {
    console.log(`✅ Serveur de test démarré sur http://localhost:${PORT}`);
});
