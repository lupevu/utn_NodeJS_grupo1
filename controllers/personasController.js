const { raw } = require('body-parser');

const Personas = require('../models/Personas');
const Libros = require('../models/Libros');

const personasController = {};

// Listar todas las personas
personasController.personasGetAll = async(req, res, next) => {
    try {
        const result = await Personas.findAll();        
        if (result.length === 0) {
            res.status(413).json({
                'Error': 'No existen personas registradas'
            });
        } else {
            res.status(200).json({'Las personas que se encuentran registradas son': result});
        }
    } catch (error) {
        next(error);
    }
};

// Buscar una persona por id
personasController.personaGetId = async(req, res, next) => {
    try {
        //Capturamos el id
        const { id } = req.params;    
        
        //Verificamos que id sea un número
        if(!parseInt(id,10)){
            res.status(413).json({ 'Error': 'Se esperaba un Número'});
        }     
        //Consultamos 
        const result = await Personas.findAll({
            where: {
                id
            }
        });        
        if (result.length === 0) {
            return res.status(413).json({
                'Error':'Persona no encontrada' 
            });
        } else {
            res.status(200).json({'la persona solicitada es': result});
        }
    } catch (error) {
        next(error);
    }
}

// Guardar una persona
personasController.personaAdd = async(req, res, next) => {
    try {        
        // Valido nombre tenga contenido y sea STRING
        if(!req.body.nombre || (req.body.nombre && !/[a-z]+$/i.test(req.body.nombre.trim()))){
            return res.status(413).json({ 'Error': 'El nombre es obligatorio, debe contener solo letras y no puede estar vacío'});
        }
        
        //Valido apellido tenga contenido y sea STRING
        if(!req.body.apellido || (req.body.apellido && !/[a-z]+$/i.test(req.body.apellido.trim()))){        
            return res.status(413).json({ 'Error': 'El apellido es obligatorio, debe contener solo letras y no puede estar vacío'});
        }

        //Valido alias tenga contenido y sea STRING
        if(!req.body.alias || (req.body.alias && !/[a-z]+$/i.test(req.body.alias.trim()))){
            return res.status(413).json({ 'Error': 'El alias es obligatorio, debe contener solo letras y no puede estar vacío'});
        }

        //Valido la estructura del email
        if(!req.body.email || (req.body.email && !/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(req.body.email))){
            return res.status(413).json({ 'Error': 'El email es obligatorio y debe tener cierta estructura: ejemplo@ejemplo.com'});
        }
        
        //Convierto los datos enviados por POST a mayusculas
        const nombre = req.body.nombre.toUpperCase();
        const apellido = req.body.apellido.toUpperCase();
        const alias = req.body.alias.toUpperCase();
        const email = req.body.email.toUpperCase();

        //Verifico exista el email en la base de datos
        const verifEmail = await Personas.findAll({
            where: {
                email
            }
        });
        if (verifEmail.length == 0){
            // si el email no existe, inserto la persona
            const result = await Personas.create({
                nombre: nombre,
                apellido: apellido,
                alias: alias,
                email: email
            });            
            if (result.length === 0) {
                res.status(413).json({ 'Error': 'Hubo un error al intentar guardar la persona'});
                
            } else {
                res.status(200).json({'La persona ingresada es': result.dataValues});
            }
        } else {
            return res.status(413).json({
                'Error': 'El email ya se encuentra registrado' 
            });
        }
    } catch (error) {
        next(error);
    }
}

// Actualizar una persona por id
personasController.personaUpdateId = async(req, res, next) => {
    try {
        const { id } = req.params;

        //Verificamos que id sea un número
        if(!parseInt(id,10)){
            res.status(413).json({ 'Error': 'Se esperaba un número'});
        }     

        // buscamos el id capturado
        const result = await Personas.findByPk( id );
        
        if(!result){
            return res.status(413).json({'Error':'Persona no encontrada'});
        } else {       
            // Valido nombre tenga contenido y sea STRING
            if(!req.body.nombre || typeof req.body.nombre === undefined || !/[a-z]+$/i.test(req.body.nombre.trim())){
                res.status(413).json({ 'Error': 'El nombre es obligatorio, debe contener solo letras y no puede estar vacío'});
            }
            
            //Valido apellido tenga contenido y sea STRING
            if(!req.body.apellido || !/[a-z]+$/i.test(req.body.apellido.trim())){
                res.status(413).json({ 'Error': 'El apellido es obligatorio, debe contener solo letras y no puede estar vacío'});
            }

            //Valido alias tenga contenido y sea STRING
            if(!req.body.alias || !/[a-z]+$/i.test(req.body.alias.trim())){
                res.status(413).json({ 'Error': 'El alias es obligatorio, debe contener solo letras y no puede estar vacío'});
            }
            
            //Convierto los datos enviados por POST a mayusculas
            const nombre = req.body.nombre.toUpperCase();
            const apellido = req.body.apellido.toUpperCase();
            const alias = req.body.alias.toUpperCase();
            
            // si existe el id, tratamos de actualizarlo con los datos enviados por post            
            const actualizo = await Personas.update({
                nombre,
                apellido,
                alias                    
            }, {
                where: {
                    id
                }
            });                
            if (actualizo == 0) {                    
                res.status(413).json({ 'Error': 'Hubo un error al intentar actualizar la persona'});
            } else {      
                res.status(200).json({'Mensaje': 'Datos del id ' + id + ' actualizados.'});
            }           
        }
    } 
    catch(error){
        next(error)
    }
}

//Eliminar una persona por id
personasController.personaDeleteId = async(req, res,next) => {
    const { id } = req.params;    
    
    try {
        //Verificamos que id sea un número
        if(!parseInt(id,10)){
            res.status(413).json({ 'Error': 'Se esperaba un número'});
        }     
        let result = await Libros.findAll({
            where: {
                persona_id: id
            }
        }); 
        if (result.length > 0) {
            return res.status(413).json({
                "Error": "Esta persona tiene libros asociados, no se puede borrar" 
            });   
        } 
        
        result = await Personas.destroy({
            where: {
                id
            }}
        ); 
        if(result == 0) { 
            res.status(413).json({
                'Error': 'Persona no encontrada' 
            });                        
        } else {
            res.status(200).json({'Mensaje': 'Persona eliminada'});            
        } 
    } catch(error){
        next(error)
    }
}

module.exports = personasController;