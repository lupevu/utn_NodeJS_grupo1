const express = require('express');
const helmet = require('helmet');

const app = express();

// Importamos la dependencia dotenv para configurar las variables de entrono
require('dotenv').config({ path: 'variables.env' });
const port=process.env.PORT|| 8888;
const host=process.env.HOST||'0.0.0.0';

//app.use(express.urlencoded()); //body formulario
//app.use(express.json()); // body en formato json

const db = require('./config/db');

db.authenticate()
.then(()=>{
    db.sync()
    .then(() => console.log('Conectado al Servidor Mysql'))
    .catch(error => console.log(error.message));
})
.catch((error)=>console.log(error.message))

const routes = require('./routes/index');
app.use('/', routes);

// Manejo de los errores con un middleware
app.use((error,req,res,next)=>{
    console.log('Hubo un error inesperado'); 
    res.status(413).send({'Error inesperado': error.message});     
});

//Inclusión módulo helmet en el proyecto
app.use(helmet());

//Creamos el Servidor
app.listen(port,host,(req,res)=>{
    console.log('Servidor '+host+' escuchando puerto:'+port);
});