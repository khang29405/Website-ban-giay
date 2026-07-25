const { sql, poolPromise } = require("../config/db");

async function findAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT MaDM, TenDanhMuc FROM DANH_MUC ORDER BY MaDM");
    return result.recordset;
}

async function findById(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaDM", sql.Int, id)
        .query("SELECT MaDM, TenDanhMuc FROM DANH_MUC WHERE MaDM = @MaDM");
    return result.recordset[0] || null;
}

async function create(tenDanhMuc) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("TenDanhMuc", sql.NVarChar(100), tenDanhMuc)
        .query(`
            INSERT INTO DANH_MUC (TenDanhMuc)
            OUTPUT INSERTED.MaDM, INSERTED.TenDanhMuc
            VALUES (@TenDanhMuc)
        `);
    return result.recordset[0];
}

async function update(id, tenDanhMuc) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaDM", sql.Int, id)
        .input("TenDanhMuc", sql.NVarChar(100), tenDanhMuc)
        .query(`
            UPDATE DANH_MUC
            SET TenDanhMuc = @TenDanhMuc
            OUTPUT INSERTED.MaDM, INSERTED.TenDanhMuc
            WHERE MaDM = @MaDM
        `);
    return result.recordset[0] || null;
}

async function remove(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaDM", sql.Int, id)
        .query("DELETE FROM DANH_MUC WHERE MaDM = @MaDM");
    return result.rowsAffected[0] > 0;
}

module.exports = { findAll, findById, create, update, remove };
