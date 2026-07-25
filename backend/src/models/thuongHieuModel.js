const { sql, poolPromise } = require("../config/db");

async function findAll() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT MaTH, TenThuongHieu FROM THUONG_HIEU ORDER BY MaTH");
    return result.recordset;
}

async function findById(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaTH", sql.Int, id)
        .query("SELECT MaTH, TenThuongHieu FROM THUONG_HIEU WHERE MaTH = @MaTH");
    return result.recordset[0] || null;
}

async function create(tenThuongHieu) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("TenThuongHieu", sql.NVarChar(100), tenThuongHieu)
        .query(`
            INSERT INTO THUONG_HIEU (TenThuongHieu)
            OUTPUT INSERTED.MaTH, INSERTED.TenThuongHieu
            VALUES (@TenThuongHieu)
        `);
    return result.recordset[0];
}

async function update(id, tenThuongHieu) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaTH", sql.Int, id)
        .input("TenThuongHieu", sql.NVarChar(100), tenThuongHieu)
        .query(`
            UPDATE THUONG_HIEU
            SET TenThuongHieu = @TenThuongHieu
            OUTPUT INSERTED.MaTH, INSERTED.TenThuongHieu
            WHERE MaTH = @MaTH
        `);
    return result.recordset[0] || null;
}

async function remove(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaTH", sql.Int, id)
        .query("DELETE FROM THUONG_HIEU WHERE MaTH = @MaTH");
    return result.rowsAffected[0] > 0;
}

module.exports = { findAll, findById, create, update, remove };
