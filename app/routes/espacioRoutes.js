// Cargamos el módulo Express para crear un router.
const express = require("express");

// Creamos una instancia de Router para las rutas de espacios.
const router = express.Router();

// Cargamos el controller de espacio.
const espacioController = require("../controllers/espacioController");

// Ruta GET /api/espacios para obtener todos los espacios (e.g., lista de lugares disponibles).
router.get("/", espacioController.getAll);

// Ruta GET /api/espacios/:id para obtener un espacio específico (e.g., verificar estado de E1).
router.get("/:id", espacioController.getById);

// Ruta POST /api/espacios para crear un nuevo espacio (e.g., agregar un lugar al parqueo).
// Datos en req.body: { numero: "E5", estado: "Libre" }.
router.post("/", espacioController.create);

// Ruta PUT /api/espacios/:id para actualizar un espacio (e.g., cambiar estado manualmente).
// :id del espacio; datos en req.body.
router.put("/:id", espacioController.update);

// Ruta DELETE /api/espacios/:id para eliminar un espacio (verifica que no esté en uso).
// :id del espacio a eliminar.
router.delete("/:id", espacioController.delete);

// Exportamos el router.
module.exports = router;
