const express = require("express");

const app = express();

app.get('/', (req, res) => {
    res.send('<h1>Test serveur</h1>');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur test démarré sur le port ${PORT}`);
});
