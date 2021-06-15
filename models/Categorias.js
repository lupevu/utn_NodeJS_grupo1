const Sequelize = require('sequelize');
const db = require('../config/db');

const Categorias=db.define('categorias', {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nombre:{
        type:Sequelize.STRING(30),
        allowNull:false,
        validate: {                        
            is: {
                args: ["^[a-z]+$",'i'],
                msg: 'El nombre no puede estar vacio o contener números'
            },        
        }
    }    
},{
    hooks:{
        beforeCreate:(categoria)=> {
            categoria.nombre=categoria.nombre.toUpperCase().trim();
        }
    }
});


module.exports = Categorias;