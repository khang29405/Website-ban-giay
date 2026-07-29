const sql = require("mssql");

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: true,
        // SQL Server luu SYSDATETIME()/GETDATE() theo gio local cua may chay DB (VN, UTC+7),
        // khong phai UTC. Mac dinh driver (useUTC: true) se hieu nham gia tri do la UTC,
        // lam moi thoi gian hien thi bi lech +7h. Tat useUTC de doc/ghi dung theo gio local.
        useUTC: false,
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
