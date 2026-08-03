const { sql, poolPromise } = require("../config/db");

const SELECT_COLUMNS = `
    yt.MaYeuThich, yt.MaND, yt.MaSP, yt.NgayThem,
    sp.TenSP, sp.MoTa, sp.Gia, sp.HinhAnh, sp.TrangThai,
    sp.MaDM, dm.TenDanhMuc, sp.MaTH, th.TenThuongHieu
`;

const JOIN_CLAUSE = `
    FROM YEU_THICH yt
    JOIN SAN_PHAM sp ON yt.MaSP = sp.MaSP
    JOIN DANH_MUC dm ON sp.MaDM = dm.MaDM
    JOIN THUONG_HIEU th ON sp.MaTH = th.MaTH
`;

async function findByUser(maND) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .query(`SELECT ${SELECT_COLUMNS} ${JOIN_CLAUSE} WHERE yt.MaND = @MaND ORDER BY yt.MaYeuThich DESC`);
    return result.recordset;
}

async function findByUserAndProduct(maND, maSP) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("MaSP", sql.Int, maSP)
        .query("SELECT * FROM YEU_THICH WHERE MaND = @MaND AND MaSP = @MaSP");
    return result.recordset[0] || null;
}

async function create(maND, maSP) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("MaSP", sql.Int, maSP)
        .query("INSERT INTO YEU_THICH (MaND, MaSP) VALUES (@MaND, @MaSP)");
}

async function remove(maND, maSP) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("MaSP", sql.Int, maSP)
        .query("DELETE FROM YEU_THICH WHERE MaND = @MaND AND MaSP = @MaSP");
}

module.exports = { findByUser, findByUserAndProduct, create, remove };
