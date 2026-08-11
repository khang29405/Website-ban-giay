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
    moi_nhat: "ORDER BY sp.NgayTao DESC",
    // Thu tu "ngau nhien" nhung on dinh trong 1 ngay: CHECKSUM(MaSP, ngay-hien-tai) cho
    // ra 1 gia tri gia-ngau-nhien nhung KHONG doi neu goi lai nhieu lan cung ngay - nho
    // vay phan trang (OFFSET/FETCH) khong bi trung/thieu san pham giua cac trang, va thu
    // tu se doi khac vao ngay hom sau.
    ngau_nhien: "ORDER BY CHECKSUM(sp.MaSP, CAST(GETDATE() AS DATE))",
    // "ban_chay" can them JOIN rieng (SOLD_STATS_JOIN) nen khong nam trong map nay, xu ly
    // rieng ben duoi.
};

// LEFT JOIN toi 1 subquery da GROUP BY san san theo MaSP (khong lam trung dong ket qua
// chinh) de lay tong so luong da ban tu don Hoan Thanh - chi gan vao query khi sapXep la
// "ban_chay", tranh ton chi phi JOIN cho cac truong hop sap xep khac.
const SOLD_STATS_JOIN = `
    LEFT JOIN (
        SELECT bt.MaSP, SUM(ctdh.SoLuong) AS SoLuongDaBan
        FROM CHI_TIET_DON_HANG ctdh
        JOIN BIEN_THE_SAN_PHAM bt ON bt.MaBienThe = ctdh.MaBienThe
        JOIN DON_HANG dh ON dh.MaDH = ctdh.MaDH
        WHERE dh.TrangThai = 'HoanThanh'
        GROUP BY bt.MaSP
    ) soldStats ON soldStats.MaSP = sp.MaSP
`;

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
    const isBanChay = sapXep === "ban_chay";
    const joinClause = isBanChay ? `${JOIN_CLAUSE} ${SOLD_STATS_JOIN}` : JOIN_CLAUSE;
    const orderByClause = isBanChay
        ? "ORDER BY ISNULL(soldStats.SoLuongDaBan, 0) DESC, sp.NgayTao DESC"
        : SORT_CLAUSES[sapXep] || "ORDER BY sp.MaSP";

    if (!page) {
        const result = await request.query(`SELECT ${SELECT_COLUMNS} ${joinClause} ${whereClause} ${orderByClause}`);
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
        ${joinClause} ${whereClause} ${orderByClause}
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);

    return { items: result.recordset, total, page: pageNum, limit: pageSize };
}

// San pham noi bat cho trang chu: uu tien theo tong so luong da ban (chi tinh don
// Hoan Thanh, dung logic voi thong ke Admin), neu chua du @Limit san pham tung ban
// duoc thi bu them bang san pham moi nhat (NgayTao) de trang chu khong bi trong.
async function findFeatured(limit = 8) {
    const pool = await poolPromise;
    const limitNum = Math.max(1, Number(limit) || 8);

    const bestSelling = await pool.request().input("Limit", sql.Int, limitNum).query(`
        SELECT TOP (@Limit) ${SELECT_COLUMNS}, SUM(ctdh.SoLuong) AS SoLuongDaBan
        ${JOIN_CLAUSE}
        JOIN BIEN_THE_SAN_PHAM bt ON bt.MaSP = sp.MaSP
        JOIN CHI_TIET_DON_HANG ctdh ON ctdh.MaBienThe = bt.MaBienThe
        JOIN DON_HANG dh ON dh.MaDH = ctdh.MaDH
        WHERE dh.TrangThai = 'HoanThanh' AND sp.TrangThai = 1
        GROUP BY sp.MaSP, sp.TenSP, sp.MoTa, sp.Gia, sp.HinhAnh, sp.TrangThai, sp.MaDM, dm.TenDanhMuc, sp.MaTH, th.TenThuongHieu, sp.NgayTao
        ORDER BY SoLuongDaBan DESC, sp.NgayTao DESC
    `);

    let items = bestSelling.recordset;
    if (items.length < limitNum) {
        const remain = limitNum - items.length;
        const have = items.map((r) => r.MaSP);
        const excludeClause = have.length ? `AND sp.MaSP NOT IN (${have.join(",")})` : "";
        const fallback = await pool.request().input("Limit", sql.Int, remain).query(`
            SELECT TOP (@Limit) ${SELECT_COLUMNS}
            ${JOIN_CLAUSE}
            WHERE sp.TrangThai = 1 ${excludeClause}
            ORDER BY sp.NgayTao DESC
        `);
        items = items.concat(fallback.recordset);
    }
    return items;
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

module.exports = { findAll, findFeatured, findById, create, update, updateTrangThai, remove };
