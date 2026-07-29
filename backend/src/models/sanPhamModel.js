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

const SORT_CLAUSES = {
    gia_tang: "ORDER BY sp.Gia ASC",
    gia_giam: "ORDER BY sp.Gia DESC",
};

async function findAll({ ten, maSp, maDM, maTH, sapXep, chiHienThi, page, limit } = {}) {
    const pool = await poolPromise;
    const request = pool.request();
    const conditions = [];

    if (ten) {
        request.input("Ten", sql.NVarChar(200), `%${ten}%`);
        conditions.push("sp.TenSP LIKE @Ten");
    }
    if (maSp) {
        request.input("MaSpSearch", sql.NVarChar(20), `%${maSp}%`);
        conditions.push("CAST(sp.MaSP AS NVARCHAR(20)) LIKE @MaSpSearch");
    }
    if (maDM) {
        request.input("MaDM", sql.Int, maDM);
        conditions.push("sp.MaDM = @MaDM");
    }
    if (maTH) {
        request.input("MaTH", sql.Int, maTH);
        conditions.push("sp.MaTH = @MaTH");
    }
    if (chiHienThi) {
        conditions.push("sp.TrangThai = 1");
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderByClause = SORT_CLAUSES[sapXep] || "ORDER BY sp.MaSP";

    if (!page) {
        const result = await request.query(`SELECT ${SELECT_COLUMNS} ${JOIN_CLAUSE} ${whereClause} ${orderByClause}`);
        return result.recordset;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 12);

    const countResult = await request.query(`SELECT COUNT(*) AS Total ${JOIN_CLAUSE} ${whereClause}`);
    const total = countResult.recordset[0].Total;

    request.input("Offset", sql.Int, (pageNum - 1) * pageSize);
    request.input("PageSize", sql.Int, pageSize);
    const result = await request.query(`
        SELECT ${SELECT_COLUMNS}
        ${JOIN_CLAUSE} ${whereClause} ${orderByClause}
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);

    return { items: result.recordset, total, page: pageNum, limit: pageSize };
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
