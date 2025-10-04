// Cargamos el módulo Sequelize "ORM" para el manejo de las entidades como objetos.
const Sequelize = require("sequelize");

// Usamos la función require para cargar el módulo db.config.js para traer los parámetros preconfigurados de la BD.
const dbConfig = require("../config/db.config.js");

// Creamos una variable sequelize y la inicializamos como un Objeto Sequelize con la información de la BD.
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false  // Permite conexiones SSL sin verificación estricta (útil para desarrollo; ajusta en producción)
        }
    },
    pool: {
        max: dbConfig.pool.max,      // Máximo número de conexiones en el pool.
        min: dbConfig.pool.min,      // Mínimo número de conexiones en el pool.
        acquire: dbConfig.pool.acquire,  // Tiempo máximo para adquirir una conexión (ms).
        idle: dbConfig.pool.idle     // Tiempo máximo que una conexión puede estar inactiva antes de cerrarse (ms).
    },
    // Opcional: Configuración adicional para logging y sincronización (solo en desarrollo).
    logging: console.log,  // Registra las consultas SQL en consola (desactiva en producción con false).
    // sync: { force: false }  // No se usa aquí; úsalo en pruebas para sincronizar modelos automáticamente.
});

// Creamos un objeto db vacío para almacenar todos los modelos y la instancia de sequelize.
const db = {};

// La variable db.Sequelize = módulo importado Sequelize que está declarado previamente donde se importa el módulo.
db.Sequelize = Sequelize;

// Se define una variable con la configuración de sequelize (instancia principal para conexiones).
db.sequelize = sequelize;

// Se crea una variable cliente que importa el modelo que está dentro de la carpeta models/cliente.model.js.
db.cliente = require("./cliente.model.js")(sequelize, Sequelize);

// Se crea una variable espacio que importa el modelo que está dentro de la carpeta models/espacio.model.js.
db.espacio = require("./espacio.model.js")(sequelize, Sequelize);

// Se crea una variable tarifa que importa el modelo que está dentro de la carpeta models/tarifa.model.js.
db.tarifa = require("./tarifa.model.js")(sequelize, Sequelize);

// Se crea una variable ticket que importa el modelo que está dentro de la carpeta models/ticket.model.js.
db.ticket = require("./ticket.model.js")(sequelize, Sequelize);

// Opcional: Cargar asociaciones entre modelos (debes llamar a associate en cada modelo).
// Esto se ejecuta después de cargar todos los modelos para evitar errores de dependencias.
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Se utiliza el export para que el objeto db pueda ser accedido a través de otras clases o módulos.
module.exports = db;
