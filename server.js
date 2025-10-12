// Importamos el módulo Express para crear la aplicación web/API.
const express = require("express");

// Importamos body-parser para parsear cuerpos de peticiones (JSON y form-data).
const bodyParser = require("body-parser");

// Importamos CORS para permitir peticiones cross-origin (e.g., desde un frontend en localhost:8081).
const cors = require("cors");

// Creamos una instancia de la aplicación Express.
const app = express();

// Configuramos opciones de CORS para permitir origen específico (frontend en localhost:8081).
var corsOptions = {
  origin: "http://localhost:8081"
};

// Aplicamos el middleware CORS a toda la app.
app.use(cors(corsOptions));

// Parseamos peticiones de content-type: application/json (para APIs REST con JSON).
app.use(bodyParser.json());

// Parseamos peticiones de content-type: application/x-www-form-urlencoded (para forms HTML).
app.use(bodyParser.urlencoded({ extended: true }));

// Cargamos los modelos de la BD desde /app/models (index.js que centraliza cliente, espacio, etc.).
const db = require("./app/models");

// Sincronizamos los modelos con la BD (crea tablas si no existen; no borra datos existentes).
db.sequelize.sync();
// Opcional: Para desarrollo/pruebas, descomenta para borrar y recrear tablas (¡cuidado, pierde datos!).
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Tablas borradas y recreadas.");
// });

// Ruta simple raíz (GET /) para verificar que el servidor funciona.
app.get("/", (req, res) => {
  // Respondemos con un mensaje relacionado al proyecto de parqueo.
  res.json({ 
    message: "API de Parqueo - Sistema de Estacionamiento UMG" 
  });
});

// Ruta informativa para la API (GET /api) con lista de endpoints disponibles.
app.get("/api", (req, res) => {
  // Respondemos con info de la API y sus endpoints principales.
  res.json({
    message: "Bienvenido a la API de Parqueo v1.0",
    endpoints: {
      clientes: "/api/clientes (CRUD de clientes)",
      espacios: "/api/espacios (manejo de lugares de parqueo)",
      tarifas: "/api/tarifas (configuración de cobros)",
      tickets: "/api/tickets (registro de entradas/salidas y cálculos)"
    },
    ejemplo: "POST /api/tickets/entrada para registrar una entrada"
  });
});


// Importamos Swagger para documentar la API
const swaggerDocs = require("./app/config/swagger");


// Montamos las rutas de clientes bajo el prefijo /api/clientes.
// Esto hace que GET /api/clientes apunte a clienteRoutes.getAll, etc.
const clienteRoutes = require("./app/routes/clienteRoutes");
app.use("/api/clientes", clienteRoutes);

// Montamos las rutas de espacios bajo /api/espacios.
const espacioRoutes = require("./app/routes/espacioRoutes");
app.use("/api/espacios", espacioRoutes);

// Montamos las rutas de tarifas bajo /api/tarifas.
const tarifaRoutes = require("./app/routes/tarifaRoutes");
app.use("/api/tarifas", tarifaRoutes);

// Montamos las rutas de tickets bajo /api/tickets (incluye /entrada y /:id/salida).
const ticketRoutes = require("./app/routes/ticketRoutes");
app.use("/api/tickets", ticketRoutes);

// Documentación Swagger (disponible en /api/docs)
swaggerDocs(app);


// Middleware global para manejar rutas no encontradas (responde 404).
app.use((req, res) => {
  // Si llega aquí, la ruta no existe.
  res.status(404).json({
    message: "Ruta no encontrada. Verifica la URL."
  });
});


// Configuramos el puerto (usa variable de entorno o 8081 por defecto).
const PORT = process.env.PORT || 8081;

// Iniciamos el servidor y escuchamos peticiones en el puerto especificado.
app.listen(PORT, () => {
  // Mensaje de confirmación en consola al iniciar.
  console.log(`Servidor corriendo en puerto ${PORT}.`);
  console.log(`Prueba la API en: http://localhost:${PORT}/api`);
});

// Opcional: Manejo de cierre de servidor (e.g., para limpiar conexiones BD).
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  db.sequelize.close();
  process.exit();
});
