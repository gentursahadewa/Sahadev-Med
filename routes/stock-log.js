const express = require("express");
const router = express.Router();

const db = require("../config/database");

router.get("/", (req, res) => {

    db.all(`
        SELECT
            s.created_at,
            m.name,
            s.transaction_type,
            s.quantity,
            s.note
        FROM stock_transactions s
        JOIN medicines m
            ON m.id = s.medicine_id
        ORDER BY s.created_at DESC
    `,
    [],
    (err, rows) => {

        if (err) {
            console.error(err);
            return res.send("Terjadi kesalahan");
        }

        res.render("stock-log", {
            rows
        });

    });

});

module.exports = router;