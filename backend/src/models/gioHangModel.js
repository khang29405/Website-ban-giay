const { sql, poolPromise } = require("../config/db");

const SELECT_COLUMNS = `
    gh.MaGioHang, gh.MaND, gh.MaBienThe, gh.SoLuong,
    bt.KichCo, bt.MauSac, bt.SoLuongTon,
    sp.MaSP, sp.TenSP, sp.HinhAnh, sp.Gia, sp.TrangThai
`;

const JOIN_CLAUSE = `
    FROM GIO_HANG gh
    JOIN BIEN_THE_SAN_PHAM bt ON gh.MaBienThe = bt.MaBienThe
    JOIN SAN_PHAM sp ON bt.MaSP = sp.MaSP
`;

async function findByUser(maND) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .query(`SELECT ${SELECT_COLUMNS} ${JOIN_CLAUSE} WHERE gh.MaND = @MaND ORDER BY gh.MaGioHang DESC`);
    return result.recordset;
}

async function findById(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaGioHang", sql.Int, id)
        .query(`SELECT ${SELECT_COLUMNS} ${JOIN_CLAUSE} WHERE gh.MaGioHang = @MaGioHang`);
    return result.recordset[0] || null;
}

async function findByUserAndVariant(maND, maBienThe) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("MaBienThe", sql.Int, maBienThe)
        .query("SELECT * FROM GIO_HANG WHERE MaND = @MaND AND MaBienThe = @MaBienThe");
    return result.recordset[0] || null;
}

async function findVariantById(maBienThe) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaBienThe", sql.Int, maBienThe)
        .query("SELECT MaBienThe, SoLuongTon FROM BIEN_THE_SAN_PHAM WHERE MaBienThe = @MaBienThe");
    return result.recordset[0] || null;
}

async function create({ MaND, MaBienThe, SoLuong }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, MaND)
        .input("MaBienThe", sql.Int, MaBienThe)
        .input("SoLuong", sql.Int, SoLuong)
        .query(`
            INSERT INTO GIO_HANG (MaND, MaBienThe, SoLuong)
            OUTPUT INSERTED.MaGioHang
            VALUES (@MaND, @MaBienThe, @SoLuong)
        `);
    return findById(result.recordset[0].MaGioHang);
}

async function updateSoLuong(id, soLuong) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaGioHang", sql.Int, id)
        .input("SoLuong", sql.Int, soLuong)
        .query("UPDATE GIO_HANG SET SoLuong = @SoLuong WHERE MaGioHang = @MaGioHang");
    return findById(id);
}

async function remove(id) {
    const pool = await poolPromise;
    await pool.request().input("MaGioHang", sql.Int, id).query("DELETE FROM GIO_HANG WHERE MaGioHang = @MaGioHang");
}

module.exports = { findByUser, findById, findByUserAndVariant, findVariantById, create, updateSoLuong, remove };
