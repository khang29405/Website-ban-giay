const sql = require("mssql");

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: true,
    },
};

// Named instance (vd: SQLEXPRESS) dung SQL Server Browser de tim port,
// khong duoc khai bao port cung luc voi instanceName.
if (process.env.DB_INSTANCE) {
    config.options.instanceName = process.env.DB_INSTANCE;
} else {
    config.port = Number(process.env.DB_PORT) || 1433;
}

const poolPromise = new sql.ConnectionPool(config).connect();

poolPromise.then(
    () => console.log("Đã kết nối SQL Server"),
    (err) => console.error("Lỗi kết nối SQL Server:", err.message)
);

module.exports = { sql, poolPromise };
