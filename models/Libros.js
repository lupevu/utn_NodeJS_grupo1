const { ForeignKeyConstraintError } = require('sequelize');
const Sequelize = require('sequelize');
const db = require('../config/db');
const Categorias = require("./Categorias");
const Personas = require("./Personas");


const Libros = db.define('libros', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type: Sequelize.STRING(40),
        allowNull:false,
        validate:{
            customF(value){
                if(value.trim()==''){throw new Error('Cadena Vacia');}
            }
        }
    },
    descripcion:{
            type: Sequelize.STRING(254),
            allowNull:true            
    },   
});
//Crea las relaciones con categorias y personas
Libros.belongsTo(Personas,{foreignKey:'persona_id'}); //persona_id
Libros.belongsTo(Categorias,{foreignKey:'categoria_id'}); //categoria_id

module.exports = Libros;
