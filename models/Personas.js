const Sequelize = require('sequelize');
const db = require('../config/db');

const Personas = db.define('personas', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: Sequelize.STRING(40),
    apellido: Sequelize.STRING(40),
    email: Sequelize.STRING(30),
    alias: Sequelize.STRING(20),
}, {
    hooks: {
        beforeCreate(persona) {
            persona.nombre = persona.nombre.toUpperCase().trim();
            persona.apellido = persona.apellido.toUpperCase().trim();
            persona.alias = persona.alias.toUpperCase().trim();
            persona.email = persona.email.toUpperCase().trim();
        }
    }
});

module.exports = Personas;