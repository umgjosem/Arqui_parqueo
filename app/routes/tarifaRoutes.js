// Cargamos Express Router.
const express = require("express");

// Creamos el router para tarifas.
const router = express.Router();

// Cargamos el controller de tarifa.
const tarifaController = require("../controllers/tarifaController");

// Ruta GET /api/tarifas para obtener todas las tarifas activas (e.g., para mostrar opciones de cobro).
// Opcional: ?activo=false para ver inactivas, pero el controller filtra por defecto.
router.get("/", tarifaController.getAll);

// Ruta GET /api/tarifas/:id para obtener una tarifa específica (e.g., detalles de "por hora").
router.get("/:id", tarifaController.getById);

// Ruta POST /api/tarifas para crear una nueva tarifa (e.g., agregar tarifa nocturna).
// Datos en req.body: { descripcion: "Por hora", monto_por_hora: 5000 }.
router.post("/", tarifaController.create);

// Ruta PUT /api/tarifas/:id para actualizar una tarifa (e.g., cambiar monto).
// :id de la tarifa; datos en req.body.
router.put("/:id", tarifaController.update);

// Ruta DELETE /api/tarifas/:id para desactivar una tarifa (no elimina si está en uso).
// :id de la tarifa.
router.delete("/:id", tarifaController.delete);

// Exportamos el router.
module.exports = router;
