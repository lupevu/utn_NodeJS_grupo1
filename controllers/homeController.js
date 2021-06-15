const express = require('express');
const router = express.Router();

exports.getHomePage = router.get('/',(req,res) => {
    res.status(200).send('Ésta es la página inicial');
});