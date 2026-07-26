const { sql, poolPromise } = require("../config/db");

async function findByProductId(maSP) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaSP", sql.Int, maSP)
        .query("SELECT MaBienThe, MaSP, KichCo, MauSac, SoLuongTon FROM BIEN_THE_SAN_PHAM WHERE MaSP = @MaSP ORDER BY MaBienThe");
    return result.recordset;
}

async function findById(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaBienThe", sql.Int, id)
        .query("SELECT MaBienThe, MaSP, KichCo, MauSac, SoLuongTon FROM BIEN_THE_SAN_PHAM WHERE MaBienThe = @MaBienThe");
    return result.recordset[0] || null;
}

async function create(maSP, { KichCo, MauSac, SoLuongTon }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaSP", sql.Int, maSP)
        .input("KichCo", sql.NVarChar(10), KichCo)
        .input("MauSac", sql.NVarChar(50), MauSac)
        .input("SoLuongTon", sql.Int, SoLuongTon ?? 0)
        .query(`
            INSERT INTO BIEN_THE_SAN_PHAM (MaSP, KichCo, MauSac, SoLuongTon)
            OUTPUT INSERTED.MaBienThe, INSERTED.MaSP, INSERTED.KichCo, INSERTED.MauSac, INSERTED.SoLuongTon
            VALUES (@MaSP, @KichCo, @MauSac, @SoLuongTon)
        `);
    return result.recordset[0];
}

async function update(id, { KichCo, MauSac, SoLuongTon }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaBienThe", sql.Int, id)
        .input("KichCo", sql.NVarChar(10), KichCo)
        .input("MauSac", sql.NVarChar(50), MauSac)
        .input("SoLuongTon", sql.Int, SoLuongTon)
        .query(`
            UPDATE BIEN_THE_SAN_PHAM
            SET KichCo = @KichCo, MauSac = @MauSac, SoLuongTon = @SoLuongTon
            OUTPUT INSERTED.MaBienThe, INSERTED.MaSP, INSERTED.KichCo, INSERTED.MauSac, INSERTED.SoLuongTon
            WHERE MaBienThe = @MaBienThe
        `);
    return result.recordset[0] || null;
}

async function remove(id) {
    const pool = await poolPromise;
    await pool.request().input("MaBienThe", sql.Int, id).query("DELETE FROM BIEN_THE_SAN_PHAM WHERE MaBienThe = @MaBienThe");
}

module.exports = { findByProductId, findById, create, update, remove };
