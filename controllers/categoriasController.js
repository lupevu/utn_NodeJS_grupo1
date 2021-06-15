//Importamos las dependencias
const Categorias = require('../models/Categorias');
const Libros = require('../models/Libros');

// Listar todas las categorias
exports.categoriaGet = async(req,res,next) => {
    try{
        const result = await Categorias.findAll(); 
        if(result != ''){ 
            return res.status(200).json({'Las categorías que se encuentran registradas son': result});
        } else {
            return res.status(413).json({
                'Error': 'No existen categorías registradas' 
            });        
        }
    }
    catch(error){        
        next(error)
    }
}

// Buscar una categoria por id
exports.categoriaGetId = async(req,res,next) => {
    try{
        if(req.params.id == null){
            return res.status(413).json({ 'Error': 'Se esperaba un parámetro id:Int'});
        }
        const id = req.params.id;
        if(!parseInt(id,10)){
            return res.status(413).json({ 'Error': 'Se esperaba un número'});
        } 
        const result = await Categorias.findOne({
            where :{
                id
            }
        }); 
        if(result != null){ 
            return res.status(200).json({'La categoría solicitada es': result});
        } else {
            return res.status(413).json({
                'Error':'Categoría no encontrada' 
            });
        } 
    }
    catch(error){
        next(error)
    }
}

// Metodo para verificar si existe una categoria con ese nombre
categoriaGetNombre = async(nombre) => {
    if(nombre == null || nombre.trim() == ''){
        return res.status(413).json({ 'Error': 'Se esperaba un parametro nombre:String'});
    }   
    const result = await Categorias.findOne({
        where :{
            nombre
        }
    }); 
    return (result != null ? true : false);
}

// Guardar una categoria
exports.categoriaCreate = async(req,res,next) => {
    try{        
        if(!req.body.nombre || !/[a-z]+$/i.test(req.body.nombre.trim())){
            return res.status(413).json({ 'Error': 'El nombre es obligatorio, debe contener solo letras y no puede estar vacío'});
        }
        const nombre = req.body.nombre.trim();
        if(await categoriaGetNombre(nombre)){            
            return res.status(413).json({
                'Error': 'La categoría ya se encuentra registrada' 
            });
        }
        result = await Categorias.create({
            nombre
        }); 
        if(result != null){
            return res.status(200).json(result.dataValues);
        } else {
            throw new Error('Hubo un error al intentar guardar la categoría');
        }
    }
    catch(error){
        next(error);
    }
}

// Eiminar una categoria por id
exports.categoriaDelete = async(req,res,next) => {
    try{        
        const id = req.params.id;
        if(!parseInt(id,10)){
            return res.status(413).json({ 'Error': 'Se esperaba un número'});
        } 
        //valida que la categoría no tenga ningún libro para eliminar  
        let result = await Libros.findAll({
            where: {
                categoria_id: id
            }
        });
        if(result.length > 0){
            return res.status(413).json({
                "Error": "Esta categoría tiene libros asociados, no se puede borrar" 
            });                 
        }         
        result = await Categorias.destroy({
            where: {
                id
            }}
        ); 
        if(result == 0) { 
            return res.status(413).json({
                'Error': 'Categoría no encontrada.' 
            });                        
        } else {
            return res.status(200).json({'Mensaje': 'Categoría eliminada.'});            
        } 
    }
    catch(error){
        next(error)
    }
}