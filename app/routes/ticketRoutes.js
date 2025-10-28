// Cargamos Express Router.
const express = require("express");

// Creamos el router para tickets.
const router = express.Router();

// Cargamos el controller de ticket.
const ticketController = require("../controllers/ticketController");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Registro de entradas y salidas del parqueo
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Obtiene todos los tickets registrados
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Lista de tickets
 */

/**
 * @swagger
 * /tickets/entrada:
 *   post:
 *     summary: Registra la entrada de un vehículo
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cliente:
 *                 type: integer
 *               id_espacio:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Entrada registrada exitosamente
 */

/**
 * @swagger
 * /tickets/{id}/salida:
 *   put:
 *     summary: Registra la salida de un vehículo y calcula el cobro
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Salida registrada y ticket actualizado
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Obtiene un ticket por ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ticket encontrado
 *       404:
 *         description: Ticket no encontrado
 */
/**
 * @swagger
 * /tickets/cliente/{id_cliente}:
 *   get:
 *     summary: Obtener todos los tickets asociados a un cliente
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id_cliente
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de tickets del cliente
 *       404:
 *         description: Cliente no encontrado o sin tickets
 *       500:
 *         description: Error interno del servidor
 */



// Ruta GET /api/tickets para obtener todos los tickets (activos por defecto).
// Opcional: ?estado=Finalizado para filtrar (pasa a req.query.estado).
router.get("/", ticketController.getAll);

// Ruta GET /api/tickets/:id para obtener un ticket específico (e.g., detalles de un cobro).
router.get("/:id", ticketController.getById);

// Ruta GET /api/tickets/cliente/:id_cliente → obtener todos los tickets de un cliente
router.get("/cliente/:id_cliente", ticketController.getByCliente);

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
