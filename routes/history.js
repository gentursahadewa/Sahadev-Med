const express = require("express");

const router = express.Router();

const db = require("../config/database");


// =====================
// HALAMAN RIWAYAT
// =====================

router.get("/", (req, res) => {

    db.all(
        `
        SELECT

            a.id,

            a.administered_at,

            a.note,

            COUNT(i.id) AS total_items,

            GROUP_CONCAT(
                m.name,
                ', '
            ) AS medicine_names

        FROM administrations a

        LEFT JOIN administration_items i
            ON i.administration_id = a.id

        LEFT JOIN medicines m
            ON m.id = i.medicine_id

        GROUP BY a.id

        ORDER BY datetime(a.administered_at) DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.send(
                    "Gagal mengambil riwayat"
                );

            }

            res.render(
                "history",
                {
                    rows
                }
            );

        }
    );

});


// =====================
// DETAIL RIWAYAT
// =====================

router.get("/:id", (req, res) => {

    db.all(
        `
        SELECT

            m.name,

            m.unit,

            i.amount,

            a.administered_at,

            a.note

        FROM administration_items i

        JOIN medicines m
            ON m.id = i.medicine_id

        JOIN administrations a
            ON a.id = i.administration_id

        WHERE a.id = ?
        `,
        [
            req.params.id
        ],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.send(
                    "Gagal mengambil detail"
                );

            }

            res.render(
                "history-detail",
                {
                    rows
                }
            );

        }
    );

});


// =====================
// HAPUS RIWAYAT
// =====================

router.post(
    "/delete/:id",
    (req, res) => {

        db.all(
            `
            SELECT

                medicine_id,

                amount

            FROM administration_items

            WHERE administration_id = ?
            `,
            [
                req.params.id
            ],
            (err, items) => {

                if (err) {

                    console.error(err);

                    return res.send(
                        "Gagal menghapus"
                    );

                }

                items.forEach(item => {

                    db.run(
                        `
                        UPDATE medicines

                        SET stock =
                            stock + ?

                        WHERE id = ?
                        `,
                        [
                            item.amount,
                            item.medicine_id
                        ]
                    );

                });

                db.run(
                    `
                    DELETE FROM administration_items

                    WHERE administration_id = ?
                    `,
                    [
                        req.params.id
                    ]
                );

                db.run(
                    `
                    DELETE FROM administrations

                    WHERE id = ?
                    `,
                    [
                        req.params.id
                    ],
                    () => {

                        res.redirect(
                            "/history"
                        );

                    }
                );

            }
        );

    }
);

module.exports = router;