const Libros = require('../models/Libros');
const Categorias = require('../models/Categorias');
const Personas = require('../models/Personas');

const librosController = {};

// Guardar un libro
librosController.libroAdd = async (req, res, next) => {
    try {
                
        //verifica que la descripcion no sea nula para que permitir usar uppercase        
        let descripcion = req.body.descripcion;
        if (descripcion != null) {
            descripcion = req.body.descripcion.toUpperCase(); //toma el campo descripcion traido del body y lo convierte a mayusculas            
        }
        
        let nombre = req.body.nombre;
        const categoria_id = req.body.categoria_id;
        let persona_id = req.body.persona_id;

        //verifica que la categoria no este vacia y el nombre tampoco este vacio
        if (!nombre || (nombre && !/[a-z]+$/i.test(nombre.trim()))) {
            return res.status(413).json({ 'Error': 'El nombre es obligatorio, debe contener solo letras y no puede estar vacío' });
        }
        //verifica que el campo categoriaId sea un dato valido
        if (!categoria_id || (categoria_id && !/[0-9]+$/i.test(categoria_id.trim()))) {
            return res.status(413).json({ 'Error': 'La categoría es obligatoria, debe contener solo números y no puede estar vacío' });
        }        

        //busca la existencia de la categoria en la que se intenta incluir el libro        
        const verifCategoria = await Categorias.findAll({
            where: {
                id: categoria_id
            }
        });

        if (verifCategoria.length == '') {
            return res.status(413).json({
                'Error': "No existe la categoría indicada"
            });
        }

        //si el libro se ingresa sin datos de personaId el valor de personaId se carga en null
        if (persona_id.trim() === '') {
            persona_id = null;
        } else { //si el dato de persona_id no es vacio se realiza la comprobacion de que persona_id sea un dato valido (numerico)
            if (!persona_id || !/[0-9]+$/i.test(persona_id.trim())) {
                return res.status(413).json({ 'Error': "La persona debe ser un valor numérico" });
            } else {// verifica que la persona exista en la tabla personas validando personaId en la tabla
                const verifPersona = await Personas.findAll({ where: { id: persona_id } });
                if (verifPersona.length === 0) {//|| verifPersona.result == null    )   {
                    return res.status(413).json({ 'Error': "No existe la persona indicada" });
                }
            }
        }
        // valida la existencia del libro a incorporar buscando en la tabla libros si existe un libro con ese nombre y categoria
        const verifNombreyCat = await Libros.findAll({ where: { nombre, categoria_id } });
        if (verifNombreyCat.length == 0) { //si no encuentra una coincidencia de libro y categoria se procede a incorporar el libro
            const result = await Libros.create({
                nombre,
                descripcion,
                categoria_id,
                persona_id,
            });
            console.log("resultado Incorporación", result.length);
            if (result.length === 0) {
                return res.status(413).json({ 'Error': 'No se ha podido incorporar el nuevo Libro' });
            } else {
                return res.status(200).json({ 'El libro ingresado es': result.dataValues });
            }
        }
        else {
            return res.status(413).json({ 'Error': 'Ese libro ya existe' });
        }
    } catch (error) {
        next(error);
    }
}

// Prestar un libro por id, cargando en el campo personaId de libro el id de persona
librosController.libroPrestar = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!parseInt(id, 10)) {
            res.status(413).json({ 'Error': 'Se esperaba un número' });
        }

        const persona_id = req.body.persona_id; //tomo el id de la persona a la que se le presta el libro y que pasa por el body como param
        if (persona_id == "" || !/[0-9]+$/i.test(persona_id.trim())) {// verifica que el id de la persona a la que se presta no sea vacio ni distinto de numero
            return res.status(413).json({ 'Error': 'Persona_id no puede estar vacío y debe ser un número' });
        }
        let result = await Personas.findByPk(persona_id);  //consulto la existencia de la persona 

        if (!result) { //si el resultado es vacio la persona no existe en la bd con ese id
            return res.status(413).json({ 'Error': 'No se encontro la persona a la que se quiere prestar el libro' });
        }

        //si el resultado de buscar a la persona por el id es verdadero procedo a la busqueda de la existencia del libro por id
        result = await Libros.findByPk(id);              //busca el id del libro pasado en la url

        if (!result) { //si el resultado de la busqueda es falso mostrara el mensaje de no se encontro el libro
            return res.status(413).json({ 'Error': 'No se encontro el libro' });
        }    // en caso de que la busqueda del libro por id sea verdadera  se continua y se verifica que no este prestado
        if (result.persona_id != null) { // si el campo personaId del libro buscado no es null entonces el libro esta prestado
            return res.status(413).json({ 'Error': 'El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva' });
        }
        else { // si el campo personaId es null procede a realizar el update del campo personaId 
            const update = await Libros.update({
                persona_id: persona_id
            },
                {
                    where: { id: id }
                });
            console.log(update[0]);
            if (update === 0) {
                return res.status(404).json({ 'Error': 'No se actualizaron los datos' });
            } else {
                return res.status(200).json({ Mensaje: 'Se prestó correctamente' });
            }
        }
    } catch (error) {
        next(error);
        
    }
};

// Devolver un libro por id
librosController.libroDevolver = async (req, res) => {
    const { id } = req.params;

    if (id == "" || !/[0-9]+$/i.test(id.trim())) {// verifica que el id del libro a devolver sea numerico y no vacio
        return res.status(413).json({ 'Error': 'Ingrese un dato válido' });
    }
    const result = await Libros.findByPk(id);  //consulto la existencia del libro

    if (!result) { //si el resultado es vacio el libro no existe en la bd con ese id
        return res.status(413).json({ 'Error': 'Ese libro no existe' });
    }

    if (result.persona_id != null) { // si el campo personaId del libro buscado no es null entonces el libro esta prestado
        try {
            const update = await Libros.update({
                persona_id: null
            }, //se realiza el update poniendo en null el campo persona _id
                {
                    where: { id: id }
                });
            console.log(update[0]);
            if (update === 0) {
                return res.status(404).json({ 'Error': 'No se actualizaron los datos' });
            } else {
                return res.status(200).json({ Mensaje: 'Se realizó la devolución correctamente' });
            }
        } catch (err) {
            res.status(413).json(err, 'Error inesperado');
        }
    } else { // si el campo personaId era null no estaba prestado el libro
        return res.json({ Error: 'El libro no estaba prestado!' });
    }
};

// Actualizar la descripcion de un libro por id
librosController.libroUpdateDescripcionPorId = async (req, res, next) => {
    const { id } = req.params;
    if (!parseInt(id, 10)) {
        res.status(413).json({ 'Error': 'Se esperaba un número' });
    }
    const result = await Libros.findByPk(id);
    if (!result) {
        return res.status(404).send({ "Error": "Libro no encontrado." });
    }
    //verifica que la descripcion no sea nula para que permitir usar uppercase
    let descripcion = req.body.descripcion;
    if (descripcion != null) {
        descripcion = req.body.descripcion.toUpperCase(); //toma el campo descripcion traido del body y lo convierte a mayusculas            
    }
    try {
        const update = await Libros.update({
            descripcion
        },
            {
                where: {
                    id
                }
            });
        console.log()
        if (update == 0) {
            return res.status(413).json({ 'Error': 'No se actualizaron los datos' });
        } else {
            return res.status(200).json({ 'Mensaje': 'La descripcion del libro con el id ' + id + ' fue actualizada.' });
        }
    } catch (error) {
        next(error);
    }
}


// Eiminar un libro por id
librosController.DeleteLibro = async (req, res, next) => {
    const { id } = req.params;
    if (!id || !/[0-9]+$/i.test(id.trim())) { //verifica que el id pasado sea numerico
        return res.status(413).json({ 'Error': 'Se esperaba un número' });
    }
    let result = await Libros.findByPk(id);// busca si existe el libro con el id suministrado
    if (!result) { //si el resultado es vacio el libro no existe en la bd con ese id
        return res.status(404).json({ 'Error': 'Ese libro no existe' });
    }
    if (result.persona_id == null) {// si personaId es null el libro no se encuentra prestado y por lo tanto puede ser eliminado
        try {
            result = await Libros.destroy({ //realiza el delete de libro donde por id
                where: { id }
            });
        } catch (error) {
            next(error);
        }
    }
    if (result > 0) {              //si result es mayor a 0 la operacion fue exitosa
        return res.status(200).json({ Mensaje: 'Se borró correctamente' });
    }
    else {
        return res.status(413).json({ 'Error': 'Ese libro está prestado, no se puede borrar' });
    }
}

// Listar todos los libros                       
librosController.libroGetAll = async (req, res, next) => {
    try {
        const result = await Libros.findAll();
        if (result != '') {
            return res.status(200).json({ 'Los libros que se encuentran registrados son': result });
        } else {
            return res.status(413).json({
                'Error': 'No existen libros registrados'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Buscar un libro por id
librosController.libroGetId = async (req, res, next) => {
    try {
        if (req.params.id == null) {
            return res.status(413).json({ 'Error': 'Se esperaba un parámetro id:Int' });
        }
        const id = req.params.id;
        if (!parseInt(id, 10)) {
            res.status(413).json({ 'Error': 'Se esperaba un número' });
        }
        const result = await Libros.findOne({
            where: {
                id
            }
        });
        if (result != null) {
            res.status(200).json({ 'El libro solicitado es': result });
        } else {
            res.status(413).json({
                'Error': 'Libro no encontrado'
            });
        }
    } catch (error) {
        next(error);
    }
}
module.exports = librosController;
