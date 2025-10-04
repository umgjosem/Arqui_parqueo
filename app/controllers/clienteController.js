// Cargamos los modelos desde el archivo index.js de models para acceder a las entidades de la BD.
const db = require("../models");

// Creamos un objeto clienteController para agrupar todas las funciones (métodos) del controller.
const clienteController = {};

// Método para obtener todos los clientes (GET /api/clientes).
clienteController.getAll = async (req, res) => {
    // Usamos try-catch para manejar errores de manera controlada.
    try {
        // Llamamos al modelo cliente para obtener todos los registros con include para tickets relacionados (opcional, para ver historial).
        const clientes = await db.cliente.findAll({
            include: [{ model: db.ticket, as: 'tickets' }]  // Incluye tickets asociados para más detalles.
        });
        // Enviamos respuesta exitosa con status 200 OK y los datos en JSON.
        res.status(200).json({
            message: "Clientes obtenidos exitosamente",
            data: clientes
        });
    } catch (error) {
        // Si hay un error (e.g., problema de BD), enviamos status 500 y el mensaje de error.
        res.status(500).json({
            message: "Error al obtener clientes",
            error: error.message
        });
    }
};

// Método para obtener un cliente por ID (GET /api/clientes/:id).
clienteController.getById = async (req, res) => {
    // Extraemos el ID del parámetro de la URL (req.params.id).
    const id = req.params.id;
    try {
        // Buscamos el cliente por ID; si no existe, findByPk retorna null.
        const cliente = await db.cliente.findByPk(id, {
            include: [{ model: db.ticket, as: 'tickets' }]  // Incluye tickets para contexto.
        });
        // Verificamos si el cliente existe; si no, enviamos 404 Not Found.
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        // Enviamos el cliente encontrado con status 200.
        res.status(200).json({
            message: "Cliente obtenido exitosamente",
            data: cliente
        });
    } catch (error) {
        // Capturamos errores y respondemos con 500.
        res.status(500).json({
            message: "Error al obtener cliente",
            error: error.message
        });
    }
};

// Método para crear un nuevo cliente (POST /api/clientes).
clienteController.create = async (req, res) => {
    // Extraemos los datos del body de la petición (e.g., { nit, nombre, placa }).
    const { nit, nombre, placa } = req.body;
    try {
        // Verificamos si ya existe un cliente con el mismo NIT (para evitar duplicados).
        const clienteExistente = await db.cliente.findOne({ where: { nit } });
        if (clienteExistente) {
            return res.status(400).json({
                message: "Cliente con NIT ya existe"
            });
        }
        // Creamos el nuevo cliente usando el modelo.
        const nuevoCliente = await db.cliente.create({
            nit,
            nombre,
            placa
        });
        // Enviamos respuesta con status 201 Created y el nuevo cliente.
        res.status(201).json({
            message: "Cliente creado exitosamente",
            data: nuevoCliente
        });
    } catch (error) {
        // Si hay error (e.g., validación fallida), respondemos con 500.
        res.status(500).json({
            message: "Error al crear cliente",
            error: error.message
        });
    }
};

// Método para actualizar un cliente existente (PUT /api/clientes/:id).
clienteController.update = async (req, res) => {
    // Extraemos ID de params y datos de body.
    const id = req.params.id;
    const { nit, nombre, placa } = req.body;
    try {
        // Buscamos el cliente por ID.
        const cliente = await db.cliente.findByPk(id);
        // Si no existe, enviamos 404.
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        // Verificamos si el nuevo NIT ya existe en otro cliente.
        const clienteConNIT = await db.cliente.findOne({ where: { nit } });
        if (clienteConNIT && clienteConNIT.id_cliente !== id) {
            return res.status(400).json({
                message: "NIT ya está en uso por otro cliente"
            });
        }
        // Actualizamos los campos del cliente.
        await cliente.update({ nit, nombre, placa });
        // Enviamos el cliente actualizado con status 200.
        res.status(200).json({
            message: "Cliente actualizado exitosamente",
            data: cliente
        });
    } catch (error) {
        // Manejo de errores.
        res.status(500).json({
            message: "Error al actualizar cliente",
            error: error.message
        });
    }
};

// Método para eliminar un cliente (DELETE /api/clientes/:id). Nota: En producción, considera soft-delete.
clienteController.delete = async (req, res) => {
    // Extraemos ID de params.
    const id = req.params.id;
    try {
        // Buscamos y eliminamos el cliente (esto también elimina tickets relacionados si usas onDelete: 'CASCADE').
        const cliente = await db.cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        // Eliminamos el cliente.
        await cliente.destroy();
        // Enviamos confirmación con status 200.
        res.status(200).json({
            message: "Cliente eliminado exitosamente"
        });
    } catch (error) {
        // Manejo de errores.
        res.status(500).json({
            message: "Error al eliminar cliente",
            error: error.message
        });
    }
};

// Exportamos el objeto controller para usarlo en rutas.
module.exports = clienteController;
