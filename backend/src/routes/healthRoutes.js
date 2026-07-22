const express = require("express");
const { sql, poolPromise } = require("../config/db");

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiem tra server va ket noi database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server va DB deu hoat dong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     server: { type: string, example: up }
 *                     db: { type: string, example: connected }
 *       500:
 *         description: Khong ket noi duoc database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
