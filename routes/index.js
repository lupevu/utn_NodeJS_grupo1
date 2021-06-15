//Importamos las dependencias
const express = require('express');
const router = express.Router();

//Importamos los controladores
const homeController = require('../controllers/homeController');
const categoriasController = require('../controllers/categoriasController');
const personasController = require('../controllers/personasController');
const librosController = require('../controllers/librosController');

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

//Ruta para el home
router.get('/', homeController.getHomePage);

//Rutas Categorias
router.get('/categoria',categoriasController.categoriaGet);
router.get('/categoria/:id', categoriasController.categoriaGetId);
router.post('/categoria/', categoriasController.categoriaCreate);
router.delete('/categoria/:id', categoriasController.categoriaDelete);

//Rutas Personas
router.get('/persona', personasController.personasGetAll);
router.get('/persona/:id', personasController.personaGetId);
router.post('/persona', personasController.personaAdd);
router.put('/persona/:id', personasController.personaUpdateId);
router.delete('/persona/:id', personasController.personaDeleteId);

//Rutas Libros
router.get('/libro', librosController.libroGetAll);
router.get('/libro/:id', librosController.libroGetId);

//nahuel---------------------------------------------
router.post('/libro', librosController.libroAdd);
router.put('/libro/:id', librosController.libroUpdateDescripcionPorId);
router.put('/libro/prestar/:id', librosController.libroPrestar);
router.put('/libro/devolver/:id',librosController.libroDevolver);
router.delete('/libro/:id', librosController.DeleteLibro);
//nahuel---------------------------------------------

module.exports = router;