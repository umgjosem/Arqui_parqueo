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

// Método para crear un nuevo cliente (POST /api/clientes)
clienteController.create = async (req, res) => {
    // Extraemos el nombre del body de la petición
    const { nombre } = req.body;
    try {
        // Verificamos si ya existe un cliente con el mismo nombre
        const clienteExistente = await db.cliente.findOne({ where: { nombre } });
        if (clienteExistente) {
            return res.status(400).json({
                message: "Cliente con ese nombre ya existe"
            });
        }

        // Creamos el nuevo cliente usando el modelo
        const nuevoCliente = await db.cliente.create({ nombre });

        // Enviamos respuesta con status 201 Created y el nuevo cliente
        res.status(201).json({
            message: "Cliente creado exitosamente",
            data: nuevoCliente
        });
    } catch (error) {
        // Si hay error, respondemos con 500
        res.status(500).json({
            message: "Error al crear cliente",
            error: error.message
        });
    }
};

// Método para actualizar un cliente existente (PUT /api/clientes/:id)
clienteController.update = async (req, res) => {
    const id = req.params.id;
    const { nombre } = req.body;

    try {
        // Buscamos el cliente por ID
        const cliente = await db.cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }

        // Verificamos si el nombre ya está en uso por otro cliente
        const clienteConNombre = await db.cliente.findOne({ where: { nombre } });
        if (clienteConNombre && clienteConNombre.id_cliente !== parseInt(id)) {
            return res.status(400).json({
                message: "Nombre ya está en uso por otro cliente"
            });
        }

        // Actualizamos el nombre del cliente
        await cliente.update({ nombre });

        res.status(200).json({
            message: "Cliente actualizado exitosamente",
            data: cliente
        });
    } catch (error) {
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

// Método para buscar un cliente por nombre (GET /api/clientes/nombre/:nombre)
clienteController.getByNombre = async (req, res) => {
    // Extraemos el nombre del parámetro de la URL
    const nombre = req.params.nombre;

    try {
        // Buscamos el cliente cuyo nombre coincida exactamente con el proporcionado
        const cliente = await db.cliente.findOne({
            where: { nombre },
            include: [{ model: db.ticket, as: 'tickets' }] // Incluye tickets asociados si existen
        });

        // Si no se encuentra ningún cliente, devolvemos un 404
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado con ese nombre"
            });
        }

        // Si lo encontramos, devolvemos el cliente y un mensaje de éxito
        res.status(200).json({
            message: "Cliente encontrado exitosamente",
            data: cliente
        });
    } catch (error) {
        // Si ocurre un error, devolvemos un 500 con el mensaje de error
        res.status(500).json({
            message: "Error al buscar cliente por nombre",
            error: error.message
        });
    }
};

// Exportamos el objeto controller para usarlo en rutas.
module.exports = clienteController;
