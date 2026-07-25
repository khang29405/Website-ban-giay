const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ShoeStore API",
            version: "1.0.0",
            description: "API cho website ban giay the thao",
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
                DanhMuc: {
                    type: "object",
                    properties: {
                        MaDM: { type: "integer", example: 1 },
                        TenDanhMuc: { type: "string", example: "Giay the thao" },
                    },
                },
                ThuongHieu: {
                    type: "object",
                    properties: {
                        MaTH: { type: "integer", example: 1 },
                        TenThuongHieu: { type: "string", example: "Nike" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
