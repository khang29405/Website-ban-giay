-- =========================================================
-- DATABASE: WEBSITE BAN GIAY THE THAO
-- SQL Server
-- =========================================================

CREATE DATABASE ShoeStoreDB;
GO

USE ShoeStoreDB;
GO

-- =========================================================
-- 1. BANG NGUOI_DUNG
-- =========================================================
CREATE TABLE NGUOI_DUNG (
    MaND        INT IDENTITY(1,1) PRIMARY KEY,
    HoTen       NVARCHAR(100)   NOT NULL,
    Email       NVARCHAR(100)   NOT NULL UNIQUE,
    MatKhau     NVARCHAR(255)   NOT NULL,
    SDT         NVARCHAR(15)    NULL,
    DiaChi      NVARCHAR(255)   NULL,
    VaiTro      NVARCHAR(20)    NOT NULL DEFAULT 'KhachHang', -- KhachHang | Admin
    NgayTao     DATETIME2       NOT NULL DEFAULT SYSDATETIME()
);
GO

-- =========================================================
-- 2. BANG DANH_MUC
-- =========================================================
CREATE TABLE DANH_MUC (
    MaDM        INT IDENTITY(1,1) PRIMARY KEY,
    TenDanhMuc  NVARCHAR(100)   NOT NULL
);
GO

-- =========================================================
-- 3. BANG THUONG_HIEU
-- =========================================================
CREATE TABLE THUONG_HIEU (
    MaTH            INT IDENTITY(1,1) PRIMARY KEY,
    TenThuongHieu   NVARCHAR(100)   NOT NULL UNIQUE
);
GO

-- =========================================================
-- 4. BANG SAN_PHAM
-- =========================================================
CREATE TABLE SAN_PHAM (
    MaSP        INT IDENTITY(1,1) PRIMARY KEY,
    TenSP       NVARCHAR(200)   NOT NULL,
    MoTa        NVARCHAR(MAX)   NULL,
    Gia         DECIMAL(18,2)   NOT NULL,
    HinhAnh     NVARCHAR(255)   NULL,
    TrangThai   BIT             NOT NULL DEFAULT 1, -- 1: dang ban, 0: an/ngung ban
    MaDM        INT             NOT NULL,
    MaTH        INT             NOT NULL,
    NgayTao     DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (MaDM) REFERENCES DANH_MUC(MaDM),
    CONSTRAINT FK_SanPham_ThuongHieu FOREIGN KEY (MaTH) REFERENCES THUONG_HIEU(MaTH)
);
GO

-- =========================================================
-- 5. BANG BIEN_THE_SAN_PHAM (size, mau, ton kho)
-- =========================================================
CREATE TABLE BIEN_THE_SAN_PHAM (
    MaBienThe   INT IDENTITY(1,1) PRIMARY KEY,
    MaSP        INT             NOT NULL,
    KichCo      NVARCHAR(10)    NOT NULL,
    MauSac      NVARCHAR(50)    NOT NULL,
    SoLuongTon  INT             NOT NULL DEFAULT 0,
    CONSTRAINT FK_BienThe_SanPham FOREIGN KEY (MaSP) REFERENCES SAN_PHAM(MaSP) ON DELETE CASCADE,
    CONSTRAINT UQ_BienThe UNIQUE (MaSP, KichCo, MauSac) -- khong cho trung size+mau cua cung 1 sp
);
GO

-- =========================================================
-- 6. BANG GIO_HANG
-- =========================================================
CREATE TABLE GIO_HANG (
    MaGioHang   INT IDENTITY(1,1) PRIMARY KEY,
    MaND        INT             NOT NULL,
    MaBienThe   INT             NOT NULL,
    SoLuong     INT             NOT NULL DEFAULT 1,
    CONSTRAINT FK_GioHang_NguoiDung FOREIGN KEY (MaND) REFERENCES NGUOI_DUNG(MaND) ON DELETE CASCADE,
    CONSTRAINT FK_GioHang_BienThe FOREIGN KEY (MaBienThe) REFERENCES BIEN_THE_SAN_PHAM(MaBienThe),
    CONSTRAINT UQ_GioHang UNIQUE (MaND, MaBienThe) -- 1 nguoi khong co 2 dong trung 1 bien the -> cong don SoLuong khi them lai
);
GO

-- =========================================================
-- 7. BANG DON_HANG
-- =========================================================
CREATE TABLE DON_HANG (
    MaDH            INT IDENTITY(1,1) PRIMARY KEY,
    MaND            INT             NOT NULL,
    DiaChiGiaoHang  NVARCHAR(255)   NOT NULL,
    SDTNhan         NVARCHAR(15)    NOT NULL,
    TongTien        DECIMAL(18,2)   NOT NULL,
    PhuongThucTT    NVARCHAR(50)    NOT NULL DEFAULT 'COD', -- COD, ChuyenKhoan...
    TrangThai       NVARCHAR(50)    NOT NULL DEFAULT 'ChoXuLy', -- ChoXuLy, DangGiao, HoanThanh, DaHuy
    LyDoHuy         NVARCHAR(255)   NULL, -- chi co gia tri khi TrangThai = DaHuy, Admin nhap khi huy don
    NgayDat         DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_DonHang_NguoiDung FOREIGN KEY (MaND) REFERENCES NGUOI_DUNG(MaND)
);
GO

-- =========================================================
-- 8. BANG CHI_TIET_DON_HANG
-- =========================================================
CREATE TABLE CHI_TIET_DON_HANG (
    MaCTDH      INT IDENTITY(1,1) PRIMARY KEY,
    MaDH        INT             NOT NULL,
    MaBienThe   INT             NOT NULL,
    SoLuong     INT             NOT NULL,
    DonGia      DECIMAL(18,2)   NOT NULL, -- luu gia tai thoi diem mua, khong lay gia hien tai cua SAN_PHAM
    CONSTRAINT FK_ChiTietDH_DonHang FOREIGN KEY (MaDH) REFERENCES DON_HANG(MaDH) ON DELETE CASCADE,
    CONSTRAINT FK_ChiTietDH_BienThe FOREIGN KEY (MaBienThe) REFERENCES BIEN_THE_SAN_PHAM(MaBienThe)
);
GO

UPDATE NGUOI_DUNG SET VaiTro = 'Admin' WHERE Email = N'admin@shoestore.com';
UPDATE NGUOI_DUNG SET VaiTro = 'Admin' WHERE Email = N'admin@gmail.com';

-- =========================================================
-- MIGRATION: them cot LyDoHuy neu DB da tao truoc do chua co
-- (chay lai file nay tren DB cu se tu bo sung, khong loi neu da co san)
-- =========================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('DON_HANG') AND name = 'LyDoHuy'
)
BEGIN
    ALTER TABLE DON_HANG ADD LyDoHuy NVARCHAR(255) NULL;
END
GO

-- =========================================================
-- SEED DATA (DU LIEU MAU)
-- Moi block co IF NOT EXISTS de chay lai file nhieu lan
-- khong bi trung du lieu (script khong idempotent se gay loi
-- "Subquery returned more than 1 value" o buoc SAN_PHAM).
-- Anh (HinhAnh) da duoc chon dung theo danh muc/thuong hieu
-- (kiem tra thu cong tung anh qua Unsplash truoc khi dung).
-- =========================================================

IF NOT EXISTS (SELECT 1 FROM DANH_MUC)
BEGIN
    INSERT INTO DANH_MUC (TenDanhMuc) VALUES
    (N'Giay the thao'),
    (N'Giay chay bo'),
    (N'Giay bong ro'),
    (N'Giay luoi'),
    (N'Dep / Sandal');
END
GO

IF NOT EXISTS (SELECT 1 FROM THUONG_HIEU)
BEGIN
    INSERT INTO THUONG_HIEU (TenThuongHieu) VALUES
    (N'Nike'),
    (N'Adidas'),
    (N'Puma'),
    (N'Converse'),
    (N'Vans');
END
GO

IF NOT EXISTS (SELECT 1 FROM SAN_PHAM)
BEGIN
    INSERT INTO SAN_PHAM (TenSP, MoTa, Gia, HinhAnh, MaDM, MaTH) VALUES
    (N'Nike Air Max 270', N'Giay the thao Nike dem khi em ai', 3200000,
        N'https://images.unsplash.com/photo-1499852848443-3004d6dc4cfc?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay the thao'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Nike')),
    (N'Converse Chuck Taylor All Star', N'Giay co dien Converse', 1200000,
        N'https://images.unsplash.com/photo-1597350593642-08a98ed51a42?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay the thao'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Converse')),
    (N'Converse One Star', N'Giay the thao form thap, logo ngoi sao dac trung', 1500000,
        N'https://images.unsplash.com/photo-1597350593642-08a98ed51a42?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay the thao'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Converse')),
    (N'Puma Suede Classic', N'Giay the thao phong cach co dien, chat lieu da lon', 1600000,
        N'https://images.unsplash.com/photo-1545289414-1c3cb1c06238?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay the thao'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Puma')),
    (N'Puma RS-Fast', N'Giay the thao phong cach chunky nang dong', 2100000,
        N'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay the thao'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Puma')),
    (N'Adidas Ultraboost 22', N'Giay chay bo Adidas cong nghe Boost', 3800000,
        N'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay chay bo'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Adidas')),
    (N'Adidas Duramo SL', N'Giay chay bo nhe, thoang khi, phu hop tap luyen hang ngay', 1800000,
        N'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay chay bo'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Adidas')),
    (N'Nike Pegasus Trail', N'Giay chay bo cong nghe dem khi doc quyen', 2500000,
        N'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay chay bo'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Nike')),
    (N'Nike Zoom Freak 4', N'Giay bong ro Nike phien ban Freak', 3500000,
        N'https://images.unsplash.com/photo-1645928565297-47f4708dc978?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay bong ro'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Nike')),
    (N'Nike Zoom Flash', N'Giay bong ro de bam san tot, ho tro co chan', 2200000,
        N'https://images.unsplash.com/photo-1516767254874-281bffac9e9a?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay bong ro'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Nike')),
    (N'Vans Old Skool', N'Giay luoi Vans phong cach nang dong', 1500000,
        N'https://images.unsplash.com/photo-1573554943001-ac2d0211bd90?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay luoi'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Vans')),
    (N'Vans Sk8-Hi', N'Giay co cao phong cach skate van hoa duong pho', 1700000,
        N'https://images.unsplash.com/photo-1573554943001-ac2d0211bd90?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay luoi'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Vans')),
    (N'Vans Authentic', N'Mau giay Vans nguyen ban, form basic de phoi do', 1100000,
        N'https://images.unsplash.com/flagged/photo-1556637640-2c80d3201be8?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Giay luoi'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Vans')),
    (N'Adidas Adilette', N'Dep Adidas thoai mai hang ngay', 450000,
        N'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Dep / Sandal'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Adidas')),
    (N'Adidas Slide', N'Dep quai ngang thoai mai, phu hop mang sau tap luyen', 500000,
        N'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80',
        (SELECT MaDM FROM DANH_MUC WHERE TenDanhMuc = N'Dep / Sandal'),
        (SELECT MaTH FROM THUONG_HIEU WHERE TenThuongHieu = N'Adidas'));
END
GO

IF NOT EXISTS (SELECT 1 FROM BIEN_THE_SAN_PHAM)
BEGIN
    INSERT INTO BIEN_THE_SAN_PHAM (MaSP, KichCo, MauSac, SoLuongTon)
    SELECT sp.MaSP, v.KichCo, v.MauSac, 20
    FROM SAN_PHAM sp
    CROSS APPLY (VALUES ('39', N'Den'), ('40', N'Trang'), ('41', N'Xanh')) AS v(KichCo, MauSac)
    WHERE sp.MaDM IS NOT NULL;
END
GO
