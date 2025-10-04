// Cargamos el módulo Express para crear un router (sub-aplicación) que maneje rutas específicas.
const express = require("express");

// Creamos una instancia de Router para agrupar las rutas de clientes.
const router = express.Router();

// Cargamos el controller de cliente para enlazar las rutas con sus métodos.
const clienteController = require("../controllers/clienteController");

// Definimos la ruta GET /api/clientes (o /clientes si se monta bajo /api) para obtener todos los clientes.
// Esta ruta responde a peticiones GET sin parámetros de ID.
router.get("/", clienteController.getAll);

// Definimos la ruta GET /api/clientes/:id para obtener un cliente específico por ID.
// :id es un parámetro dinámico que se pasa a req.params.id en el controller.
router.get("/:id", clienteController.getById);

// Definimos la ruta POST /api/clientes para crear un nuevo cliente.
// Espera datos en req.body (e.g., { nit, nombre, placa }) y responde con el nuevo cliente creado.
router.post("/", clienteController.create);

// Definimos la ruta PUT /api/clientes/:id para actualizar un cliente existente.
// :id identifica cuál actualizar; datos en req.body.
router.put("/:id", clienteController.update);

// Definimos la ruta DELETE /api/clientes/:id para eliminar un cliente.
// :id identifica cuál eliminar; responde con confirmación.
router.delete("/:id", clienteController.delete);

// Exportamos el router para montarlo en la aplicación principal (e.g., app.use('/api/clientes', clienteRoutes)).
module.exports = router;
