// Cargamos Express Router.
const express = require("express");

// Creamos el router para tarifas.
const router = express.Router();

// Cargamos el controller de tarifa.
const tarifaController = require("../controllers/tarifaController");

/**
 * @swagger
 * tags:
 *   name: Tarifas
 *   description: Configuración de tarifas de cobro
 */

/**
 * @swagger
 * /tarifas:
 *   get:
 *     summary: Obtiene todas las tarifas
 *     tags: [Tarifas]
 *     responses:
 *       200:
 *         description: Lista de tarifas obtenida exitosamente
 */

/**
 * @swagger
 * /tarifas/{id}:
 *   get:
 *     summary: Obtiene una tarifa por ID
 *     tags: [Tarifas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarifa encontrada
 *       404:
 *         description: Tarifa no encontrada
 */

/**
 * @swagger
 * /tarifas:
 *   post:
 *     summary: Crea una nueva tarifa
 *     tags: [Tarifas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: Tarifa hora estándar
 *               monto_por_hora:
 *                 type: number
 *                 example: 10.5
 *     responses:
 *       201:
 *         description: Tarifa creada exitosamente
 */

/**
 * @swagger
 * /tarifas/{id}:
 *   put:
 *     summary: Actualiza una tarifa
 *     tags: [Tarifas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               monto_por_hora:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tarifa actualizada
 */

/**
 * @swagger
 * /tarifas/{id}:
 *   delete:
 *     summary: Elimina una tarifa
 *     tags: [Tarifas]
 *     parameters:
 *       - in: path
 *         name: id
 *     responses:
 *       200:
 *         description: Tarifa eliminada
 */



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
