// Cargamos Express Router.
const express = require("express");

// Creamos el router para tickets.
const router = express.Router();

// Cargamos el controller de ticket.
const ticketController = require("../controllers/ticketController");

// Ruta GET /api/tickets para obtener todos los tickets (activos por defecto).
// Opcional: ?estado=Finalizado para filtrar (pasa a req.query.estado).
router.get("/", ticketController.getAll);

// Ruta GET /api/tickets/:id para obtener un ticket específico (e.g., detalles de un cobro).
router.get("/:id", ticketController.getById);

// Ruta POST /api/tickets/entrada para registrar una entrada (flujo principal de parqueo).
// Datos en req.body: { id_cliente: 1, id_espacio: 1, id_tarifa: 1 (opcional) }.
// Verifica espacio libre y ocupa automáticamente.
router.post("/entrada", ticketController.crearEntrada);

// Ruta PUT /api/tickets/:id/salida para registrar salida y calcular cobro.
// :id del ticket; no necesita body, usa hora actual para calcular horas y monto.
router.put("/:id/salida", ticketController.registrarSalida);

// Ruta POST /api/tickets para crear un ticket genérico (usa si no necesitas lógica especial de entrada).
// Datos en req.body: { id_cliente, id_espacio, id_tarifa, ... }.
router.post("/", ticketController.create);

// Ruta PUT /api/tickets/:id para actualizar un ticket (e.g., cambiar tarifa antes de salida).
// :id del ticket; datos en req.body (no permite cambiar hora_ingreso).
router.put("/:id", ticketController.update);

// Ruta DELETE /api/tickets/:id para cancelar/eliminar un ticket (libera espacio si activo).
// :id del ticket.
router.delete("/:id", ticketController.delete);

// Exportamos el router.
module.exports = router;
