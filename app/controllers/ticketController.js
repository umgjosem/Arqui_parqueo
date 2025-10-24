// Cargamos los modelos desde el archivo index.js de models para acceder a las entidades de la BD.
const db = require("../models");

// Creamos un objeto ticketController para agrupar todas las funciones (métodos) del controller.
const ticketController = {};

// Método para obtener todos los tickets (GET /api/tickets). Filtra activos por defecto.
ticketController.getAll = async (req, res) => {
    // Extraemos parámetros de query opcionales (e.g., ?estado=Activo o ?clienteId=1).
    const { estado } = req.query;
    try {
        // Obtenemos tickets con include de cliente, espacio y tarifa para mostrar detalles completos.
        const tickets = await db.ticket.findAll({
            where: estado ? { estado } : { estado: 'Activo' },  // Filtra por estado si se especifica, sino solo activos.
            include: [
                { model: db.cliente, as: 'cliente' },  // Incluye datos del cliente.
                { model: db.espacio, as: 'espacio' },  // Incluye datos del espacio.
                { model: db.tarifa, as: 'tarifa' }     // Incluye datos de la tarifa aplicada.
            ],
            order: [['hora_ingreso', 'DESC']]  // Ordena por fecha de ingreso más reciente primero.
        });
        // Enviamos respuesta exitosa con status 200 OK y los datos en JSON.
        res.status(200).json({
            message: "Tickets obtenidos exitosamente",
            data: tickets
        });
    } catch (error) {
        // Si hay un error (e.g., problema de BD), enviamos status 500 y el mensaje de error.
        res.status(500).json({
            message: "Error al obtener tickets",
            error: error.message
        });
    }
};

// Método para obtener un ticket por ID (GET /api/tickets/:id).
ticketController.getById = async (req, res) => {
    // Extraemos el ID del parámetro de la URL (req.params.id).
    const id = req.params.id;
    try {
        // Buscamos el ticket por ID con includes para contexto completo.
        const ticket = await db.ticket.findByPk(id, {
            include: [
                { model: db.cliente, as: 'cliente' },
                { model: db.espacio, as: 'espacio' },
                { model: db.tarifa, as: 'tarifa' }
            ]
        });
        // Verificamos si el ticket existe; si no, enviamos 404 Not Found.
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket no encontrado"
            });
        }
        // Enviamos el ticket encontrado con status 200.
        res.status(200).json({
            message: "Ticket obtenido exitosamente",
            data: ticket
        });
    } catch (error) {
        // Capturamos errores y respondemos con 500.
        res.status(500).json({
            message: "Error al obtener ticket",
            error: error.message
        });
    }
};

// Método especial para crear un ticket de ENTRADA (POST /api/tickets/entrada).
// Registra cliente, asigna espacio libre y crea el ticket con hora_ingreso.
ticketController.crearEntrada = async (req, res) => {
    // Extraemos datos del body: id_cliente, id_espacio, id_tarifa (opcional, usa la primera activa si no se envía).
    const { id_cliente, id_espacio, id_tarifa } = req.body;
    try {
        // Verificamos que el cliente exista.
        const cliente = await db.cliente.findByPk(id_cliente);
        if (!cliente) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        // Verificamos que el espacio exista y esté libre.
        const espacio = await db.espacio.findByPk(id_espacio);
        if (!espacio) {
            return res.status(404).json({
                message: "Espacio no encontrado"
            });
        }
        if (espacio.estado !== 'Libre') {
            return res.status(400).json({
                message: "Espacio no disponible (ocupado o reservado)"
            });
        }
        // Determinamos la tarifa: si no se envía, usa la primera activa.
        let tarifa;
        if (!id_tarifa) {
            tarifa = await db.tarifa.findOne({ where: { activo: true } });
            if (!tarifa) {
                return res.status(400).json({
                    message: "No hay tarifas activas disponibles"
                });
            }
        } else {
            tarifa = await db.tarifa.findByPk(id_tarifa);
            if (!tarifa || !tarifa.activo) {
                return res.status(400).json({
                    message: "Tarifa no encontrada o inactiva"
                });
            }
        }
        // Actualizamos el estado del espacio a 'Ocupado'.
        await espacio.update({ estado: 'Reservado' });
        // Creamos el nuevo ticket con hora_ingreso actual, horas_estadia y monto inicial en 0.
        const nuevoTicket = await db.ticket.create({
            id_cliente,
            id_espacio,
            id_tarifa: tarifa.id_tarifa,
            hora_ingreso: new Date(),  // Hora actual como ingreso.
            horas_estadia: 0,          // Se calculará al salir.
            monto_total: 0,            // Se calculará al salir.
            estado: 'Activo'
        });
        // Enviamos respuesta con status 201 Created y el nuevo ticket.
        res.status(201).json({
            message: "Entrada registrada exitosamente. Espacio ocupado.",
            data: {
                ticket: nuevoTicket,
                cliente: cliente,
                espacio: espacio,
                tarifa: tarifa
            }
        });
    } catch (error) {
        // Si hay error (e.g., validación fallida), respondemos con 500.
        res.status(500).json({
            message: "Error al registrar entrada",
            error: error.message
        });
    }
};

// Método especial para registrar SALIDA y calcular monto (PUT /api/tickets/:id/salida).
// Calcula horas, monto, actualiza ticket y libera espacio.
ticketController.registrarSalida = async (req, res) => {
    // Extraemos el ID del ticket de params.
    const id = req.params.id;
    try {
        // Buscamos el ticket activo.
        const ticket = await db.ticket.findByPk(id, {
            include: [
                { model: db.tarifa, as: 'tarifa' },
                { model: db.espacio, as: 'espacio' }
            ]
        });
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket no encontrado"
            });
        }
        if (ticket.estado !== 'Activo') {
            return res.status(400).json({
                message: "Ticket ya finalizado o cancelado"
            });
        }
        // Calculamos la diferencia en horas (hora actual - hora_ingreso).
        const hora_salida = new Date();
        const diffInMs = hora_salida - ticket.hora_ingreso;  // Diferencia en milisegundos.
        const horas_estadia = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));  // Convertimos a horas decimales (e.g., 2.5 horas).
        // Calculamos el monto: horas * monto_por_hora de la tarifa (ajusta si necesitas redondeo o fracciones).
        const monto_total = parseFloat((horas_estadia * ticket.tarifa.monto_por_hora).toFixed(2));
        // Actualizamos el ticket con hora_salida, horas, monto y estado 'Finalizado'.
        await ticket.update({
            hora_salida,
            horas_estadia,
            monto_total,
            estado: 'Finalizado'
        });
        // Liberamos el espacio actualizando su estado a 'Libre'.
        await ticket.espacio.update({ estado: 'Libre' });
        // Enviamos respuesta con status 200 y detalles del cobro.
        res.status(200).json({
            message: "Salida registrada y cobro calculado exitosamente. Espacio liberado.",
            data: {
                ticket: ticket,  // Incluye los campos actualizados.
                horas_estadia,
                monto_total,
                hora_salida
            }
        });
    } catch (error) {
        // Manejo de errores.
        res.status(500).json({
            message: "Error al registrar salida",
            error: error.message
        });
    }
};

// Método para crear un ticket general (POST /api/tickets). Úsalo si no necesitas la lógica especial de entrada.
ticketController.create = async (req, res) => {
    // Extraemos datos del body.
    const { id_cliente, id_espacio, id_tarifa, hora_ingreso, horas_estadia, monto_total, estado } = req.body;
    try {
        // Verificaciones básicas (similar a crearEntrada, pero más genérico).
        const cliente = await db.cliente.findByPk(id_cliente);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        const espacio = await db.espacio.findByPk(id_espacio);
        if (!espacio || espacio.estado !== 'Libre') {
            return res.status(400).json({ message: "Espacio no disponible" });
        }
        const tarifa = await db.tarifa.findByPk(id_tarifa);
        if (!tarifa || !tarifa.activo) {
            return res.status(400).json({ message: "Tarifa no válida" });
        }
        // Creamos el ticket.
        const nuevoTicket = await db.ticket.create({
            id_cliente,
            id_espacio,
            id_tarifa,
            hora_ingreso: hora_ingreso || new Date(),
            horas_estadia: horas_estadia || 0,
            monto_total: monto_total || 0,
            estado: estado || 'Activo'
        });
        // Actualizamos espacio a ocupado si es activo.
        if (estado === 'Activo') {
            await espacio.update({ estado: 'Ocupado' });
        }
        // Respuesta 201.
        res.status(201).json({
            message: "Ticket creado exitosamente",
            data: nuevoTicket
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al crear ticket",
            error: error.message
        });
    }
};

// Método para actualizar un ticket (PUT /api/tickets/:id). E.g., cambiar tarifa o estado.
ticketController.update = async (req, res) => {
    // Extraemos ID y datos de body.
    const id = req.params.id;
    const { id_cliente, id_espacio, id_tarifa, estado } = req.body;  // No actualizamos hora_ingreso para evitar inconsistencias.
    try {
        // Buscamos el ticket.
        const ticket = await db.ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket no encontrado"
            });
        }
        // Verificaciones para cambios (e.g., si cambiamos espacio, verifica disponibilidad).
        if (id_espacio && id_espacio !== ticket.id_espacio) {
            const nuevoEspacio = await db.espacio.findByPk(id_espacio);
            if (!nuevoEspacio || nuevoEspacio.estado !== 'Libre') {
                return res.status(400).json({ message: "Nuevo espacio no disponible" });
            }
            // Liberamos el espacio anterior si era activo.
            if (ticket.estado === 'Activo') {
                await db.espacio.findByPk(ticket.id_espacio).update({ estado: 'Libre' });
                await nuevoEspacio.update({ estado: 'Ocupado' });
            }
        }
        // Actualizamos campos permitidos.
        await ticket.update({ id_cliente, id_espacio, id_tarifa, estado });
        // Respuesta 200.
        res.status(200).json({
            message: "Ticket actualizado exitosamente",
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar ticket",
            error: error.message
        });
    }
};

// Método para eliminar/cancelar un ticket (DELETE /api/tickets/:id). Libera espacio si era activo.
ticketController.delete = async (req, res) => {
    // Extraemos ID de params.
    const id = req.params.id;
    try {
        // Buscamos el ticket.
        const ticket = await db.ticket.findByPk(id, {
            include: [{ model: db.espacio, as: 'espacio' }]
        });
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket no encontrado"
            });
        }
        // Si era activo, liberamos el espacio.
        if (ticket.estado === 'Activo') {
            await ticket.espacio.update({ estado: 'Libre' });
        }
        // Eliminamos el ticket (o marca como 'Cancelado' si prefieres soft-delete: await ticket.update({ estado: 'Cancelado' });).
        await ticket.destroy();
        // Enviamos confirmación con status 200.
        res.status(200).json({
            message: "Ticket eliminado exitosamente"
        });
    } catch (error) {
        // Manejo de errores.
        res.status(500).json({
            message: "Error al eliminar ticket",
            error: error.message
        });
    }
};

// Exportamos el objeto controller para usarlo en rutas.
module.exports = ticketController;
