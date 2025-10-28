// Cargamos los modelos desde el archivo index.js de models.
const db = require("../models");

// Creamos un objeto espacioController para agrupar los métodos.
const espacioController = {};

// Método para obtener todos los espacios (GET /api/espacios).
espacioController.getAll = async (req, res) => {
    try {
        // Obtenemos todos los espacios, ordenados por número.
        const espacios = await db.espacio.findAll({
            order: [['numero', 'ASC']]  // Ordena alfabéticamente por número (e.g., E1, E2).
        });
        // Respuesta exitosa.
        res.status(200).json({
            message: "Espacios obtenidos exitosamente",
            data: espacios
        });
    } catch (error) {
        // Error handling.
        res.status(500).json({
            message: "Error al obtener espacios",
            error: error.message
        });
    }
};

// Método para obtener un espacio por ID junto con todos sus tickets
espacioController.getById = async (req, res) => {
    const id = req.params.id;
    try {
        // Buscamos por ID incluyendo todos los tickets (sin filtrar por estado)
        const espacio = await db.espacio.findByPk(id, {
            include: [{ 
                model: db.ticket, 
                as: 'tickets'  // Incluye todos los tickets asociados
            }]
        });

        if (!espacio) {
            return res.status(404).json({
                message: "Espacio no encontrado"
            });
        }

        // Respuesta con datos
        res.status(200).json({
            message: "Espacio obtenido exitosamente",
            data: espacio
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener espacio",
            error: error.message
        });
    }
};

// Método para crear un nuevo espacio (POST /api/espacios). Útil para inicializar el parqueo.
espacioController.create = async (req, res) => {
    const { numero, estado } = req.body;  // Estado por defecto es 'Libre'.
    try {
        // Verificamos si ya existe un espacio con el mismo número.
        const espacioExistente = await db.espacio.findOne({ where: { numero } });
        if (espacioExistente) {
            return res.status(400).json({
                message: "Número de espacio ya existe"
            });
        }
        // Creamos el espacio.
        const nuevoEspacio = await db.espacio.create({
            numero,
            estado: estado || 'Libre'  // Default a Libre si no se especifica.
        });
        // Respuesta 201.
        res.status(201).json({
            message: "Espacio creado exitosamente",
            data: nuevoEspacio
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al crear espacio",
            error: error.message
        });
    }
};

// Método para actualizar un espacio (PUT /api/espacios/:id). E.g., cambiar estado manualmente.
espacioController.update = async (req, res) => {
    const id = req.params.id;
    const { numero, estado } = req.body;
    try {
        const espacio = await db.espacio.findByPk(id);
        if (!espacio) {
            return res.status(404).json({
                message: "Espacio no encontrado"
            });
        }
        // Verificamos unicidad del nuevo número si se cambia.
        if (numero && numero !== espacio.numero) {
            const espacioConNumero = await db.espacio.findOne({ where: { numero } });
            if (espacioConNumero) {
                return res.status(400).json({
                    message: "Número de espacio ya en uso"
                });
            }
        }
        // Actualizamos.
        await espacio.update({ numero, estado });
        // Respuesta 200.
        res.status(200).json({
            message: "Espacio actualizado exitosamente",
            data: espacio
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar espacio",
            error: error.message
        });
    }
};

// Método para eliminar un espacio (DELETE /api/espacios/:id). Verifica que no esté en uso.
espacioController.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const espacio = await db.espacio.findByPk(id);
        if (!espacio) {
            return res.status(404).json({
                message: "Espacio no encontrado"
            });
        }
        // Verificamos si hay tickets activos en este espacio.
        const ticketActivo = await db.ticket.findOne({
            where: { id_espacio: id, estado: 'Activo' }
        });
        if (ticketActivo) {
            return res.status(400).json({
                message: "No se puede eliminar: espacio en uso"
            });
        }
        // Eliminamos.
        await espacio.destroy();
        // Respuesta 200.
        res.status(200).json({
            message: "Espacio eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar espacio",
            error: error.message
        });
    }
};
// Método para obtener solo el estado de un espacio (GET /api/espacios/:id/estado)
espacioController.getEstadoById = async (req, res) => {
    const id = req.params.id;
    try {
        // Buscamos el espacio por ID, pero solo seleccionamos el campo 'estado'
        const espacio = await db.espacio.findByPk(id, {
            attributes: ['estado'] // 👈 solo traer el campo estado
        });

        if (!espacio) {
            return res.status(404).json({
                message: "Espacio no encontrado"
            });
        }

        // Respuesta exitosa solo con el estado
        res.status(200).json({
            message: "Estado del espacio obtenido exitosamente",
            id,
            estado: espacio.estado
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener estado del espacio",
            error: error.message
        });
    }
};


// Exportamos el controller.
module.exports = espacioController;
