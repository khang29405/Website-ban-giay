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
        // Thu tu tag o day quyet dinh thu tu hien thi tren trang Swagger UI, sap xep
        // theo luong test tu nhien: kiem tra server -> dang nhap lay token -> du lieu
        // nen (danh muc/thuong hieu) -> san pham/bien the -> gio hang -> dat hang -> lien he.
        tags: [
            { name: "Health", description: "Kiem tra server va ket noi database" },
            { name: "Auth", description: "Dang ky, dang nhap va xac thuc JWT" },
            { name: "DanhMuc", description: "Quan ly danh muc san pham" },
            { name: "ThuongHieu", description: "Quan ly thuong hieu san pham" },
            { name: "SanPham", description: "Quan ly san pham" },
            { name: "BienThe", description: "Quan ly bien the san pham (size, mau, ton kho)" },
            { name: "GioHang", description: "Gio hang cua khach hang dang dang nhap" },
            { name: "DonHang", description: "Dat hang tu gio hang (thanh toan COD)" },
            { name: "LienHe", description: "Tin nhan tu trang Lien he" },
            { name: "Upload", description: "Upload anh len Cloudinary (dung cho truong HinhAnh cua san pham)" },
            { name: "NguoiDung", description: "Quan ly tai khoan nguoi dung - danh sach, doi vai tro, khoa/mo (chi Admin)" },
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
                Pagination: {
                    type: "object",
                    description: "Chi co trong response khi client truyen query page",
                    properties: {
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 12 },
                        total: { type: "integer", example: 37, description: "Tong so ban ghi khop dieu kien loc" },
                        totalPages: { type: "integer", example: 4 },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Loi may chu" },
                    },
                },
                NguoiDung: {
                    type: "object",
                    properties: {
                        MaND: { type: "integer", example: 1 },
                        HoTen: { type: "string", example: "Nguyen Van A" },
                        Email: { type: "string", example: "a@test.com" },
                        SDT: { type: "string", nullable: true, example: "0901234567" },
                        DiaChi: { type: "string", nullable: true, example: "123 Nguyen Trai, Q1, TP.HCM" },
                        VaiTro: { type: "string", enum: ["KhachHang", "NhanVien", "Admin"], example: "KhachHang" },
                        NgayTao: { type: "string", format: "date-time" },
                        DaKhoa: { type: "boolean", example: false },
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
                        HoTen: { type: "string", example: "Nguyen Van A", description: "Ten nguoi dat don" },
                        Email: { type: "string", example: "a@test.com", description: "Email nguoi dat don" },
                        DiaChiGiaoHang: { type: "string", example: "123 Nguyen Trai, Q1, TP.HCM" },
                        SDTNhan: { type: "string", example: "0901234567" },
                        TongTien: { type: "number", example: 3200000 },
                        PhuongThucTT: { type: "string", example: "COD" },
                        TrangThai: { type: "string", example: "ChoXuLy", enum: ["ChoXuLy", "DangGiao", "HoanThanh", "DaHuy"] },
                        LyDoHuy: { type: "string", nullable: true, example: "Khach hang doi y, khong muon mua nua", description: "Chi co gia tri khi TrangThai la DaHuy" },
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
                LienHe: {
                    type: "object",
                    properties: {
                        MaLienHe: { type: "integer", example: 1 },
                        HoTen: { type: "string", example: "Nguyen Van A" },
                        Email: { type: "string", example: "a@test.com" },
                        NoiDung: { type: "string", example: "Toi muon hoi ve size giay..." },
                        DaXuLy: { type: "boolean", example: false },
                        NgayGui: { type: "string", format: "date-time" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
