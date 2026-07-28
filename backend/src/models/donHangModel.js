const { sql, poolPromise } = require("../config/db");

async function findById(maDH) {
    const pool = await poolPromise;
    const orderResult = await pool
        .request()
        .input("MaDH", sql.Int, maDH)
        .query("SELECT * FROM DON_HANG WHERE MaDH = @MaDH");
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

async function findByUser(maND) {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input("MaND", sql.Int, maND)
        .query("SELECT * FROM DON_HANG WHERE MaND = @MaND ORDER BY NgayDat DESC");
    return result.recordset;
}

async function findAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT dh.*, nd.HoTen, nd.Email
        FROM DON_HANG dh
        JOIN NGUOI_DUNG nd ON dh.MaND = nd.MaND
        ORDER BY dh.NgayDat DESC
    `);
    return result.recordset;
}

async function updateTrangThai(maDH, trangThai) {
    const pool = await poolPromise;
    await pool
        .request()
        .input("MaDH", sql.Int, maDH)
        .input("TrangThai", sql.NVarChar(50), trangThai)
        .query("UPDATE DON_HANG SET TrangThai = @TrangThai WHERE MaDH = @MaDH");
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

            await new sql.Request(transaction)
                .input("MaGioHang", sql.Int, item.MaGioHang)
                .query("DELETE FROM GIO_HANG WHERE MaGioHang = @MaGioHang");
        }

        await transaction.commit();
        return findById(maDH);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = { findById, findByUser, findAll, updateTrangThai, restoreStock, createOrder };
