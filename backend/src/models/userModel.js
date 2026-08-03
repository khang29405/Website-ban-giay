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
            "SELECT MaND, HoTen, Email, SDT, DiaChi, VaiTro, NgayTao, DaKhoa FROM NGUOI_DUNG WHERE MaND = @MaND"
        );
    return result.recordset[0] || null;
}

async function updateUser(maND, { HoTen, SDT, DiaChi }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("HoTen", sql.NVarChar(100), HoTen)
        .input("SDT", sql.NVarChar(15), SDT || null)
        .input("DiaChi", sql.NVarChar(255), DiaChi || null)
        .query(`
            UPDATE NGUOI_DUNG SET HoTen = @HoTen, SDT = @SDT, DiaChi = @DiaChi
            OUTPUT INSERTED.MaND, INSERTED.HoTen, INSERTED.Email, INSERTED.SDT, INSERTED.DiaChi, INSERTED.VaiTro, INSERTED.NgayTao
            WHERE MaND = @MaND
        `);
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

async function getPasswordHash(maND) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .query("SELECT MatKhau FROM NGUOI_DUNG WHERE MaND = @MaND");
    return result.recordset[0] ? result.recordset[0].MatKhau : null;
}

async function updatePassword(maND, matKhauHash) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("MatKhau", sql.NVarChar(255), matKhauHash)
        .query("UPDATE NGUOI_DUNG SET MatKhau = @MatKhau WHERE MaND = @MaND");
}

async function setResetToken(maND, tokenHash, expiry) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("ResetToken", sql.NVarChar(255), tokenHash)
        .input("ResetTokenExpiry", sql.DateTime2, expiry)
        .query("UPDATE NGUOI_DUNG SET ResetToken = @ResetToken, ResetTokenExpiry = @ResetTokenExpiry WHERE MaND = @MaND");
}

async function findByResetToken(tokenHash) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("ResetToken", sql.NVarChar(255), tokenHash)
        .query(
            "SELECT * FROM NGUOI_DUNG WHERE ResetToken = @ResetToken AND ResetTokenExpiry > SYSUTCDATETIME()"
        );
    return result.recordset[0] || null;
}

async function updatePasswordAndClearResetToken(maND, matKhauHash) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("MatKhau", sql.NVarChar(255), matKhauHash)
        .query(
            "UPDATE NGUOI_DUNG SET MatKhau = @MatKhau, ResetToken = NULL, ResetTokenExpiry = NULL WHERE MaND = @MaND"
        );
}

async function findAll({ vaiTro, q } = {}) {
    const pool = await poolPromise;
    const request = pool.request();
    const conditions = [];

    if (vaiTro) {
        request.input("VaiTro", sql.NVarChar(20), vaiTro);
        conditions.push("VaiTro = @VaiTro");
    }
    if (q) {
        request.input("Q", sql.NVarChar(100), `%${q}%`);
        conditions.push("(HoTen LIKE @Q OR Email LIKE @Q)");
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await request.query(`
        SELECT MaND, HoTen, Email, SDT, DiaChi, VaiTro, NgayTao, DaKhoa
        FROM NGUOI_DUNG
        ${whereClause}
        ORDER BY MaND
    `);
    return result.recordset;
}

async function updateRole(maND, vaiTro) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("VaiTro", sql.NVarChar(20), vaiTro)
        .query(`
            UPDATE NGUOI_DUNG SET VaiTro = @VaiTro
            OUTPUT INSERTED.MaND, INSERTED.HoTen, INSERTED.Email, INSERTED.SDT, INSERTED.DiaChi, INSERTED.VaiTro, INSERTED.NgayTao, INSERTED.DaKhoa
            WHERE MaND = @MaND
        `);
    return result.recordset[0] || null;
}

async function setLocked(maND, daKhoa) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .input("DaKhoa", sql.Bit, daKhoa)
        .query(`
            UPDATE NGUOI_DUNG SET DaKhoa = @DaKhoa
            OUTPUT INSERTED.MaND, INSERTED.HoTen, INSERTED.Email, INSERTED.SDT, INSERTED.DiaChi, INSERTED.VaiTro, INSERTED.NgayTao, INSERTED.DaKhoa
            WHERE MaND = @MaND
        `);
    return result.recordset[0] || null;
}

module.exports = {
    findByEmail,
    findById,
    createUser,
    updateUser,
    getPasswordHash,
    updatePassword,
    setResetToken,
    findByResetToken,
    updatePasswordAndClearResetToken,
    findAll,
    updateRole,
    setLocked,
};
