const { sql, poolPromise } = require("../config/db");

const SELECT_COLUMNS = `
    sp.MaSP, sp.TenSP, sp.MoTa, sp.Gia, sp.HinhAnh, sp.TrangThai,
    sp.MaDM, dm.TenDanhMuc, sp.MaTH, th.TenThuongHieu, sp.NgayTao
`;

const JOIN_CLAUSE = `
    FROM SAN_PHAM sp
    JOIN DANH_MUC dm ON sp.MaDM = dm.MaDM
    JOIN THUONG_HIEU th ON sp.MaTH = th.MaTH
`;

async function findAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT ${SELECT_COLUMNS} ${JOIN_CLAUSE} ORDER BY sp.MaSP`);
    return result.recordset;
}

async function findById(id) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaSP", sql.Int, id)
        .query(`SELECT ${SELECT_COLUMNS} ${JOIN_CLAUSE} WHERE sp.MaSP = @MaSP`);
    return result.recordset[0] || null;
}

async function create({ TenSP, MoTa, Gia, HinhAnh, MaDM, MaTH }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("TenSP", sql.NVarChar(200), TenSP)
        .input("MoTa", sql.NVarChar(sql.MAX), MoTa || null)
        .input("Gia", sql.Decimal(18, 2), Gia)
        .input("HinhAnh", sql.NVarChar(255), HinhAnh || null)
        .input("MaDM", sql.Int, MaDM)
        .input("MaTH", sql.Int, MaTH)
        .query(`
            INSERT INTO SAN_PHAM (TenSP, MoTa, Gia, HinhAnh, MaDM, MaTH)
            OUTPUT INSERTED.MaSP
            VALUES (@TenSP, @MoTa, @Gia, @HinhAnh, @MaDM, @MaTH)
        `);
    return findById(result.recordset[0].MaSP);
}

async function update(id, { TenSP, MoTa, Gia, HinhAnh, MaDM, MaTH }) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaSP", sql.Int, id)
        .input("TenSP", sql.NVarChar(200), TenSP)
        .input("MoTa", sql.NVarChar(sql.MAX), MoTa || null)
        .input("Gia", sql.Decimal(18, 2), Gia)
        .input("HinhAnh", sql.NVarChar(255), HinhAnh || null)
        .input("MaDM", sql.Int, MaDM)
        .input("MaTH", sql.Int, MaTH)
        .query(`
            UPDATE SAN_PHAM
            SET TenSP = @TenSP, MoTa = @MoTa, Gia = @Gia, HinhAnh = @HinhAnh, MaDM = @MaDM, MaTH = @MaTH
            WHERE MaSP = @MaSP
        `);
    return findById(id);
}

async function updateTrangThai(id, trangThai) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaSP", sql.Int, id)
        .input("TrangThai", sql.Bit, trangThai)
        .query("UPDATE SAN_PHAM SET TrangThai = @TrangThai WHERE MaSP = @MaSP");
    return findById(id);
}

async function remove(id) {
    const pool = await poolPromise;
    await pool.request().input("MaSP", sql.Int, id).query("DELETE FROM SAN_PHAM WHERE MaSP = @MaSP");
}

module.exports = { findAll, findById, create, update, updateTrangThai, remove };
