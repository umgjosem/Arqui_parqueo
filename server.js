// ===============================
// Configuración base del servidor
// ===============================

// Cargamos las variables de entorno desde el archivo .env
require("dotenv").config();

// Importamos módulos base
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Creamos una instancia de la aplicación Express
const app = express();

// ===============================
// Configuración de CORS
// ===============================
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_ORIGIN // origen definido en .env (ej: dominio del frontend)
      : "*", // en desarrollo permite todo
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


// ===============================
// Middlewares
// ===============================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===============================
// Base de datos (Sequelize)
// ===============================
const db = require("./app/models");

// Sincroniza los modelos con la base de datos
db.sequelize.sync();
// Para desarrollo: descomentar si quieres reiniciar tablas
// db.sequelize.sync({ force: true }).then(() => console.log("Tablas recreadas."));

// ===============================
// Rutas principales
// ===============================

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "API de Parqueo - Sistema de Estacionamiento UMG",
    entorno: process.env.NODE_ENV || "sin definir",
  });
});

// Ruta informativa de la API
app.get("/api", (req, res) => {
  res.json({
    message: "Bienvenido a la API de Parqueo v1.0",
    endpoints: {
      clientes: "/api/clientes",
      espacios: "/api/espacios",
      tarifas: "/api/tarifas",
      tickets: "/api/tickets",
    },
  });
});

// ===============================
// Documentación Swagger
// ===============================
const swaggerDocs = require("./app/config/swagger");

// ===============================
// Rutas de la API
// ===============================
const clienteRoutes = require("./app/routes/clienteRoutes");
const espacioRoutes = require("./app/routes/espacioRoutes");
const tarifaRoutes = require("./app/routes/tarifaRoutes");
const ticketRoutes = require("./app/routes/ticketRoutes");

app.use("/api/clientes", clienteRoutes);
app.use("/api/espacios", espacioRoutes);
app.use("/api/tarifas", tarifaRoutes);
app.use("/api/tickets", ticketRoutes);

// Inicializamos Swagger
swaggerDocs(app);

// ===============================
// Manejo de errores (404)
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada. Verifica la URL." });
});

// ===============================
// Inicio del servidor
// ===============================
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}.`);
  console.log(`Prueba la API en: http://localhost:${PORT}/api`);
  console.log(`Entorno actual: ${process.env.NODE_ENV || "sin definir"}`);
});

// ===============================
// Cierre controlado
// ===============================
process.on("SIGINT", () => {
  console.log("Cerrando servidor...");
  db.sequelize.close();
  process.exit();
});
