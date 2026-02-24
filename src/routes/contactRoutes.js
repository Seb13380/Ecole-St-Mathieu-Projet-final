const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sgdigitalweb13@gmail.com',
        pass: 'Paul3726&'
    }
});


router.get('/', (req, res) => {
    res.render('pages/contact');
});


router.post('/send', (req, res) => {
    const { name, email, message } = req.body;
    const mailOptions = {
        from: email,
        to: 'sgdigitalweb13@gmail.com', // <-- Mets ici l'adresse qui doit recevoir les messages
        subject: `Nouveau message de ${name}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send('Erreur lors de l\'envoi');
        }
        res.redirect('/contact');
    });
});

module.exports = router;
