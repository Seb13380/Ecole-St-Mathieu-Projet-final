const express = require("express");
const twig = require('twig');
const dotenv = require('dotenv');
const session = require("express-session");

dotenv.config();
const app = express();

const homeRoutes = require("./src/routes/homeRoutes");

app.set('views', __dirname + '/src/views');
app.set('view engine', 'twig');

app.use(express.static(__dirname + '/public'));
app.use(homeRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});