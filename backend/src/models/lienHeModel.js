const { sql, poolPromise } = require("../config/db");

async function create({ HoTen, Email, NoiDung }) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("HoTen", sql.NVarChar(100), HoTen)
        .input("Email", sql.NVarChar(100), Email)
        .input("NoiDung", sql.NVarChar(1000), NoiDung)
        .query(`
            INSERT INTO LIEN_HE (HoTen, Email, NoiDung)
            OUTPUT INSERTED.*
            VALUES (@HoTen, @Email, @NoiDung)
        `);
    return result.recordset[0];
}

async function findById(id) {
    const pool = await poolPromise;
    const result = await pool.request().input("MaLienHe", sql.Int, id).query("SELECT * FROM LIEN_HE WHERE MaLienHe = @MaLienHe");
    return result.recordset[0] || null;
}

async function findAll({ daXuLy, page, limit } = {}) {
    const pool = await poolPromise;
    const request = pool.request();
    const conditions = [];
    if (daXuLy !== undefined) {
        request.input("DaXuLy", sql.Bit, daXuLy === "true" || daXuLy === true);
        conditions.push("DaXuLy = @DaXuLy");
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    if (!page) {
        const result = await request.query(`SELECT * FROM LIEN_HE ${whereClause} ORDER BY NgayGui DESC`);
        return result.recordset;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);

    const countResult = await request.query(`SELECT COUNT(*) AS Total FROM LIEN_HE ${whereClause}`);
    const total = countResult.recordset[0].Total;

    request.input("Offset", sql.Int, (pageNum - 1) * pageSize);
    request.input("PageSize", sql.Int, pageSize);
    const result = await request.query(`
        SELECT * FROM LIEN_HE ${whereClause}
        ORDER BY NgayGui DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);

    return { items: result.recordset, total, page: pageNum, limit: pageSize };
}

async function updateDaXuLy(id, daXuLy) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaLienHe", sql.Int, id)
        .input("DaXuLy", sql.Bit, daXuLy)
        .query("UPDATE LIEN_HE SET DaXuLy = @DaXuLy WHERE MaLienHe = @MaLienHe");
    return findById(id);
}

module.exports = { create, findById, findAll, updateDaXuLy };
