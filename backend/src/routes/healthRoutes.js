const express = require("express");
const { sql, poolPromise } = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().query("SELECT 1 AS ok");
        res.json({ success: true, data: { server: "up", db: "connected" } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Kết nối cơ sở dữ liệu thất bại" });
    }
});

module.exports = router;
