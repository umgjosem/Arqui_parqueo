// Cargamos el módulo Express para crear un router.
const express = require("express");

// Creamos una instancia de Router para las rutas de espacios.
const router = express.Router();

// Cargamos el controller de espacio.
const espacioController = require("../controllers/espacioController");
/**
 * @swagger
 * tags:
 *   name: Espacios
 *   description: Gestión de espacios de estacionamiento
 */

/**
 * @swagger
 * /espacios:
 *   get:
 *     summary: Lista todos los espacios de parqueo
 *     tags: [Espacios]
 *     responses:
 *       200:
 *         description: Lista de espacios obtenida exitosamente
 */

/**
 * @swagger
 * /espacios/{id}:
 *   get:
 *     summary: Obtiene un espacio por ID
 *     tags: [Espacios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Espacio encontrado
 *       404:
 *         description: Espacio no encontrado
 */

/**
 * @swagger
 * /espacios:
 *   post:
 *     summary: Crea un nuevo espacio
 *     tags: [Espacios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: string
 *                 example: E1
 *               estado:
 *                 type: string
 *                 example: Libre
 *     responses:
 *       201:
 *         description: Espacio creado correctamente
 */

/**
 * @swagger
 * /espacios/{id}:
 *   put:
 *     summary: Actualiza un espacio existente
 *     tags: [Espacios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Espacio actualizado correctamente
 */

/**
 * @swagger
 * /espacios/{id}:
 *   delete:
 *     summary: Elimina un espacio
 *     tags: [Espacios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Espacio eliminado
 */
/**
 * @swagger
 * /espacios/{id}/estado:
 *   get:
 *     summary: Obtener solo el estado de un espacio
 *     tags: [Espacios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del espacio
 *     responses:
 *       200:
 *         description: Estado del espacio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estado del espacio obtenido exitosamente
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 estado:
 *                   type: string
 *                   example: Libre
 *       404:
 *         description: Espacio no encontrado
 *       500:
 *         description: Error interno del servidor
 */



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

router.get("/:id/estado", espacioController.getEstadoById);
// Exportamos el router.
module.exports = router;
