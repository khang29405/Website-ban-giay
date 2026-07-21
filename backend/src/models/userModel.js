const { sql, poolPromise } = require("../config/db");

async function findByEmail(email) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("Email", sql.NVarChar(100), email)
        .query("SELECT * FROM NGUOI_DUNG WHERE Email = @Email");
    return result.recordset[0] || null;
}

async function findById(maND) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .query(
            "SELECT MaND, HoTen, Email, SDT, DiaChi, VaiTro, NgayTao FROM NGUOI_DUNG WHERE MaND = @MaND"
        );
    return result.recordset[0] || null;
}

async function createUser({ HoTen, Email, MatKhauHash, SDT, DiaChi }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("HoTen", sql.NVarChar(100), HoTen)
        .input("Email", sql.NVarChar(100), Email)
        .input("MatKhau", sql.NVarChar(255), MatKhauHash)
        .input("SDT", sql.NVarChar(15), SDT || null)
        .input("DiaChi", sql.NVarChar(255), DiaChi || null)
        .query(`
            INSERT INTO NGUOI_DUNG (HoTen, Email, MatKhau, SDT, DiaChi)
            OUTPUT INSERTED.MaND, INSERTED.HoTen, INSERTED.Email, INSERTED.VaiTro, INSERTED.NgayTao
            VALUES (@HoTen, @Email, @MatKhau, @SDT, @DiaChi)
        `);
    return result.recordset[0];
}

module.exports = { findByEmail, findById, createUser };
