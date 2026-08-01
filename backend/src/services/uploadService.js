const cloudinary = require("../config/cloudinary");
const httpError = require("../utils/httpError");

function uploadImageBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "shoestore/san-pham" },
            (err, result) => {
                if (err) return reject(httpError(502, "Tải ảnh lên thất bại: " + err.message));
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}

// Chi xoa anh nam trong folder shoestore/san-pham (do chinh app nay upload len) - tranh
// dong cham toi resource Cloudinary khac neu vi ly do nao do HinhAnh la 1 URL Cloudinary
// khong phai do minh tao (vd dan tay). URL cu tu Unsplash (du lieu mau) khong khop pattern
// nen bi bo qua, khong gay loi.
function extractManagedPublicId(url) {
    if (!url) return null;
    const match = String(url).match(/\/(shoestore\/san-pham\/[^./?#]+)\.[a-zA-Z0-9]+(?:[?#].*)?$/);
    return match ? match[1] : null;
}

async function deleteImageIfManaged(url) {
    const publicId = extractManagedPublicId(url);
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Xóa ảnh Cloudinary thất bại:", err.message);
    }
}

module.exports = { uploadImageBuffer, deleteImageIfManaged };
