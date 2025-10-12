const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Parqueo UMG",
      version: "1.0.0",
      description: "Documentación de la API del sistema de parqueo.",
    },
    servers: [
      {
        url: "http://localhost:8081/api",
      },
    ],
  },
  apis: ["./app/routes/*.js"], // <= Aquí es donde Swagger busca las rutas
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📘 Swagger disponible en: http://localhost:8081/api/docs");
}

module.exports = swaggerDocs;
