// Importamos modelos.
const db = require("../models");

// Objeto para métodos de tarifa.
const tarifaController = {};

// Obtener todas las tarifas (GET /api/tarifas). Filtra solo activas por defecto.
tarifaController.getAll = async (req, res) => {
    try {
        // Buscamos tarifas activas (activo: true).
        const tarifas = await db.tarifa.findAll({
            where: { activo: true },
            order: [['descripcion', 'ASC']]
        });
        // Respuesta.
        res.status(200).json({
            message: "Tarifas obtenidas exitosamente",
            data: tarifas
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener tarifas",
            error: error.message
        });
    }
};

// Obtener tarifa por ID (GET /api/tarifas/:id).
tarifaController.getById = async (req, res) => {
    const id = req.params.id;
    try {
        const tarifa = await db.tarifa.findByPk(id);
        if (!tarifa) {
            return res.status(404).json({
                message: "Tarifa no encontrada"
            });
        }
        // Respuesta.
        res.status(200).json({
            message: "Tarifa obtenida exitosamente",
            data: tarifa
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener tarifa",
            error: error.message
        });
    }
};

// Crear nueva tarifa (POST /api/tarifas).
tarifaController.create = async (req, res) => {
    const { descripcion, monto_por_hora } = req.body;
    try {
        // Verificamos si ya existe con la misma descripción.
        const tarifaExistente = await db.tarifa.findOne({ where: { descripcion } });
        if (tarifaExistente && tarifaExistente.activo) {
            return res.status(400).json({
                message: "Tarifa con descripción ya existe y está activa"
            });
        }
        // Creamos.
        const nuevaTarifa = await db.tarifa.create({
            descripcion,
            monto_por_hora,
            activo: true  // Por defecto activa.
        });
        // Respuesta 201.
        res.status(201).json({
            message: "Tarifa creada exitosamente",
            data: nuevaTarifa
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al crear tarifa",
            error: error.message
        });
    }
};

// Actualizar tarifa (PUT /api/tarifas/:id).
tarifaController.update = async (req, res) => {
    const id = req.params.id;
    const { descripcion, monto_por_hora, activo } = req.body;
    try {
        const tarifa = await db.tarifa.findByPk(id);
        if (!tarifa) {
            return res.status(404).json({
                message: "Tarifa no encontrada"
            });
        }
        // Actualizamos.
        await tarifa.update({ descripcion, monto_por_hora, activo });
        // Respuesta.
        res.status(200).json({
            message: "Tarifa actualizada exitosamente",
            data: tarifa
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar tarifa",
            error: error.message
        });
    }
};

// Eliminar tarifa (DELETE /api/tarifas/:id). Solo si no tiene tickets activos.
tarifaController.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const tarifa = await db.tarifa.findByPk(id);
        if (!tarifa) {
            return res.status(404).json({
                message: "Tarifa no encontrada"
            });
        }
        // Verificamos tickets activos.
        const ticketActivo = await db.ticket.findOne({
            where: { id_tarifa: id, estado: 'Activo' }
        });
        if (ticketActivo) {
            return res.status(400).json({
                message: "No se puede eliminar: tarifa en uso"
            });
        }
        // Marcamos como inactiva en lugar de eliminar (soft-delete).
        await tarifa.update({ activo: false });
        // Respuesta.
        res.status(200).json({
            message: "Tarifa desactivada exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar tarifa",
            error: error.message
        });
    }
};

// Exportamos.
module.exports = tarifaController;
