const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "ShoeStore API",
            version: "1.0.0",
            description: "API cho website ban giay",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}/api`,
                description: "Local dev server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Loi may chu" },
                    },
                },
                DanhMuc: {
                    type: "object",
                    properties: {
                        MaDM: { type: "integer", example: 1 },
                        TenDanhMuc: { type: "string", example: "Giay the thao" },
                    },
                },
                ThuongHieu: {
                    type: "object",
                    properties: {
                        MaTH: { type: "integer", example: 1 },
                        TenThuongHieu: { type: "string", example: "Nike" },
                    },
                },
                SanPham: {
                    type: "object",
                    properties: {
                        MaSP: { type: "integer", example: 1 },
                        TenSP: { type: "string", example: "Nike Air Max 270" },
                        MoTa: { type: "string", nullable: true, example: "Giay the thao dem khi em ai" },
                        Gia: { type: "number", example: 3200000 },
                        HinhAnh: { type: "string", nullable: true, example: "https://example.com/anh.jpg" },
                        TrangThai: { type: "boolean", example: true },
                        MaDM: { type: "integer", example: 1 },
                        TenDanhMuc: { type: "string", example: "Giay the thao" },
                        MaTH: { type: "integer", example: 1 },
                        TenThuongHieu: { type: "string", example: "Nike" },
                        NgayTao: { type: "string", format: "date-time" },
                    },
                },
                BienThe: {
                    type: "object",
                    properties: {
                        MaBienThe: { type: "integer", example: 1 },
                        MaSP: { type: "integer", example: 1 },
                        KichCo: { type: "string", example: "40" },
                        MauSac: { type: "string", example: "Den" },
                        SoLuongTon: { type: "integer", example: 20 },
                    },
                },
                DonHang: {
                    type: "object",
                    properties: {
                        MaDH: { type: "integer", example: 1 },
                        MaND: { type: "integer", example: 1 },
                        DiaChiGiaoHang: { type: "string", example: "123 Nguyen Trai, Q1, TP.HCM" },
                        SDTNhan: { type: "string", example: "0901234567" },
                        TongTien: { type: "number", example: 3200000 },
                        PhuongThucTT: { type: "string", example: "COD" },
                        TrangThai: { type: "string", example: "ChoXuLy", enum: ["ChoXuLy", "DangGiao", "HoanThanh", "DaHuy"] },
                        NgayDat: { type: "string", format: "date-time" },
                        TongSoLuong: { type: "integer", nullable: true, example: 3, description: "Chi co trong GET /don-hang (danh sach), tong so luong san pham cua don" },
                        AnhXemTruoc: {
                            type: "array",
                            nullable: true,
                            description: "Chi co trong GET /don-hang (danh sach), toi da 4 anh san pham dau tien de xem truoc",
                            items: { type: "string", nullable: true, example: "https://example.com/anh.jpg" },
                        },
                        ChiTiet: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    MaCTDH: { type: "integer", example: 1 },
                                    MaBienThe: { type: "integer", example: 1 },
                                    SoLuong: { type: "integer", example: 2 },
                                    DonGia: { type: "number", example: 3200000 },
                                    KichCo: { type: "string", example: "40" },
                                    MauSac: { type: "string", example: "Den" },
                                    MaSP: { type: "integer", example: 1 },
                                    TenSP: { type: "string", example: "Nike Air Max 270" },
                                    HinhAnh: { type: "string", nullable: true, example: "https://example.com/anh.jpg" },
                                },
                            },
                        },
                    },
                },
                GioHang: {
                    type: "object",
                    properties: {
                        MaGioHang: { type: "integer", example: 1 },
                        MaND: { type: "integer", example: 1 },
                        MaBienThe: { type: "integer", example: 1 },
                        SoLuong: { type: "integer", example: 2 },
                        KichCo: { type: "string", example: "40" },
                        MauSac: { type: "string", example: "Den" },
                        SoLuongTon: { type: "integer", example: 20 },
                        MaSP: { type: "integer", example: 1 },
                        TenSP: { type: "string", example: "Nike Air Max 270" },
                        HinhAnh: { type: "string", nullable: true, example: "https://example.com/anh.jpg" },
                        Gia: { type: "number", example: 3200000 },
                        TrangThai: { type: "boolean", example: true },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
