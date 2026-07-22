const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ShoeStore API",
            version: "1.0.0",
            description: "API cho website ban giay the thao (Sprint 1: xac thuc JWT)",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}/api`,
                description: "Local dev server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Loi may chu" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
