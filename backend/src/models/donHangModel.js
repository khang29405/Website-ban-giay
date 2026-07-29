const { sql, poolPromise } = require("../config/db");

async function findById(maDH) {
    const pool = await poolPromise;
    const orderResult = await pool
        .request()
        .input("MaDH", sql.Int, maDH)
        .query(`
            SELECT dh.*, nd.HoTen, nd.Email
            FROM DON_HANG dh
            JOIN NGUOI_DUNG nd ON dh.MaND = nd.MaND
            WHERE dh.MaDH = @MaDH
        `);
    const order = orderResult.recordset[0];
    if (!order) return null;

    const detailResult = await pool
        .request()
        .input("MaDH", sql.Int, maDH)
        .query(`
            SELECT ctdh.MaCTDH, ctdh.MaBienThe, ctdh.SoLuong, ctdh.DonGia,
                   bt.KichCo, bt.MauSac,
                   sp.MaSP, sp.TenSP, sp.HinhAnh
            FROM CHI_TIET_DON_HANG ctdh
            JOIN BIEN_THE_SAN_PHAM bt ON ctdh.MaBienThe = bt.MaBienThe
            JOIN SAN_PHAM sp ON bt.MaSP = sp.MaSP
            WHERE ctdh.MaDH = @MaDH
        `);

    return { ...order, ChiTiet: detailResult.recordset };
}

async function attachItemsPreview(pool, orders) {
    if (!orders.length) return orders;

    const ids = orders.map((o) => o.MaDH);
    const result = await pool.request().query(`
        SELECT ctdh.MaDH, ctdh.SoLuong, sp.TenSP, sp.HinhAnh
        FROM CHI_TIET_DON_HANG ctdh
        JOIN BIEN_THE_SAN_PHAM bt ON ctdh.MaBienThe = bt.MaBienThe
        JOIN SAN_PHAM sp ON bt.MaSP = sp.MaSP
        WHERE ctdh.MaDH IN (${ids.join(",")})
    `);

    const itemsByOrder = {};
    result.recordset.forEach((row) => {
        (itemsByOrder[row.MaDH] = itemsByOrder[row.MaDH] || []).push(row);
    });

    return orders.map((o) => {
        const items = itemsByOrder[o.MaDH] || [];
        return {
            ...o,
            TongSoLuong: items.reduce((sum, it) => sum + it.SoLuong, 0),
            AnhXemTruoc: items.slice(0, 4).map((it) => it.HinhAnh),
        };
    });
}

async function findByUser(maND, { trangThai, page, limit } = {}) {
    const pool = await poolPromise;
    const request = pool.request().input("MaND", sql.Int, maND);
    const conditions = ["MaND = @MaND"];
    if (trangThai) {
        request.input("TrangThai", sql.NVarChar(50), trangThai);
        conditions.push("TrangThai = @TrangThai");
    }
    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    if (!page) {
        const result = await request.query(`SELECT * FROM DON_HANG ${whereClause} ORDER BY NgayDat DESC`);
        return attachItemsPreview(pool, result.recordset);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);

    const countResult = await request.query(`SELECT COUNT(*) AS Total FROM DON_HANG ${whereClause}`);
    const total = countResult.recordset[0].Total;

    request.input("Offset", sql.Int, (pageNum - 1) * pageSize);
    request.input("PageSize", sql.Int, pageSize);
    const result = await request.query(`
        SELECT * FROM DON_HANG ${whereClause}
        ORDER BY NgayDat DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);

    const items = await attachItemsPreview(pool, result.recordset);
    return { items, total, page: pageNum, limit: pageSize };
}

async function findAll({ trangThai, page, limit } = {}) {
    const pool = await poolPromise;
    const request = pool.request();
    const conditions = [];
    if (trangThai) {
        request.input("TrangThai", sql.NVarChar(50), trangThai);
        conditions.push("dh.TrangThai = @TrangThai");
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    if (!page) {
        const result = await request.query(`
            SELECT dh.*, nd.HoTen, nd.Email
            FROM DON_HANG dh
            JOIN NGUOI_DUNG nd ON dh.MaND = nd.MaND
            ${whereClause}
            ORDER BY dh.NgayDat DESC
        `);
        return attachItemsPreview(pool, result.recordset);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 10);

    const countResult = await request.query(`
        SELECT COUNT(*) AS Total
        FROM DON_HANG dh
        JOIN NGUOI_DUNG nd ON dh.MaND = nd.MaND
        ${whereClause}
    `);
    const total = countResult.recordset[0].Total;

    request.input("Offset", sql.Int, (pageNum - 1) * pageSize);
    request.input("PageSize", sql.Int, pageSize);
    const result = await request.query(`
        SELECT dh.*, nd.HoTen, nd.Email
        FROM DON_HANG dh
        JOIN NGUOI_DUNG nd ON dh.MaND = nd.MaND
        ${whereClause}
        ORDER BY dh.NgayDat DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    `);

    const items = await attachItemsPreview(pool, result.recordset);
    return { items, total, page: pageNum, limit: pageSize };
}

async function updateTrangThai(maDH, trangThai, lyDoHuy) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaDH", sql.Int, maDH)
        .input("TrangThai", sql.NVarChar(50), trangThai)
        .input("LyDoHuy", sql.NVarChar(255), lyDoHuy || null)
        .query("UPDATE DON_HANG SET TrangThai = @TrangThai, LyDoHuy = @LyDoHuy WHERE MaDH = @MaDH");
    return findById(maDH);
}

async function restoreStock(maDH) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const detailResult = await new sql.Request(transaction)
            .input("MaDH", sql.Int, maDH)
            .query("SELECT MaBienThe, SoLuong FROM CHI_TIET_DON_HANG WHERE MaDH = @MaDH");

        for (const row of detailResult.recordset) {
            await new sql.Request(transaction)
                .input("MaBienThe", sql.Int, row.MaBienThe)
                .input("SoLuong", sql.Int, row.SoLuong)
                .query("UPDATE BIEN_THE_SAN_PHAM SET SoLuongTon = SoLuongTon + @SoLuong WHERE MaBienThe = @MaBienThe");
        }

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function findVariantWithProduct(maBienThe) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaBienThe", sql.Int, maBienThe)
        .query(`
            SELECT bt.MaBienThe, bt.KichCo, bt.MauSac, bt.SoLuongTon,
                   sp.MaSP, sp.TenSP, sp.Gia, sp.TrangThai
            FROM BIEN_THE_SAN_PHAM bt
            JOIN SAN_PHAM sp ON bt.MaSP = sp.MaSP
            WHERE bt.MaBienThe = @MaBienThe
        `);
    return result.recordset[0] || null;
}

async function createOrder(maND, { DiaChiGiaoHang, SDTNhan, items, tongTien }) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const orderResult = await new sql.Request(transaction)
            .input("MaND", sql.Int, maND)
            .input("DiaChiGiaoHang", sql.NVarChar(255), DiaChiGiaoHang)
            .input("SDTNhan", sql.NVarChar(15), SDTNhan)
            .input("TongTien", sql.Decimal(18, 2), tongTien)
            .query(`
                INSERT INTO DON_HANG (MaND, DiaChiGiaoHang, SDTNhan, TongTien)
                OUTPUT INSERTED.MaDH
                VALUES (@MaND, @DiaChiGiaoHang, @SDTNhan, @TongTien)
            `);
        const maDH = orderResult.recordset[0].MaDH;

        for (const item of items) {
            await new sql.Request(transaction)
                .input("MaDH", sql.Int, maDH)
                .input("MaBienThe", sql.Int, item.MaBienThe)
                .input("SoLuong", sql.Int, item.SoLuong)
                .input("DonGia", sql.Decimal(18, 2), item.Gia)
                .query(`
                    INSERT INTO CHI_TIET_DON_HANG (MaDH, MaBienThe, SoLuong, DonGia)
                    VALUES (@MaDH, @MaBienThe, @SoLuong, @DonGia)
                `);

            await new sql.Request(transaction)
                .input("MaBienThe", sql.Int, item.MaBienThe)
                .input("SoLuong", sql.Int, item.SoLuong)
                .query(`
                    UPDATE BIEN_THE_SAN_PHAM
                    SET SoLuongTon = SoLuongTon - @SoLuong
                    WHERE MaBienThe = @MaBienThe
                `);

            if (item.MaGioHang) {
                await new sql.Request(transaction)
                    .input("MaGioHang", sql.Int, item.MaGioHang)
                    .query("DELETE FROM GIO_HANG WHERE MaGioHang = @MaGioHang");
            }
        }

        await transaction.commit();
        return findById(maDH);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = { findById, findByUser, findAll, updateTrangThai, restoreStock, createOrder, findVariantWithProduct };
