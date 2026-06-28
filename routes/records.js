const express = require("express");

const router = express.Router();

const db = require("../config/database");


// =====================
// HALAMAN FORM
// =====================

router.get("/", (req, res) => {

    db.all(
        `
        SELECT *
        FROM medicines
        ORDER BY name
        `,
        [],
        (err, medicines) => {

            if (err) {
                console.error(err);
                return res.send("Gagal mengambil data obat");
            }

            res.render(
                "records",
                {
                    medicines
                }
            );

        }
    );

});


// =====================
// SIMPAN CATATAN
// =====================

router.post("/save", (req, res) => {

    const {
        administered_at,
        note
    } = req.body;

    let medicineIds =
        req.body.medicine_id;

    let amounts =
        req.body.amount;

    // jika hanya 1 obat
    if (!Array.isArray(medicineIds)) {
        medicineIds = [medicineIds];
    }

    if (!Array.isArray(amounts)) {
        amounts = [amounts];
    }

    db.run(
        `
        INSERT INTO administrations
        (
            administered_at,
            note
        )
        VALUES
        (
            ?,
            ?
        )
        `,
        [
            administered_at,
            note
        ],
        function (err) {

            if (err) {

                console.error(err);

                return res.send(
                    "Gagal menyimpan administrasi obat"
                );

            }

            const administrationId =
                this.lastID;

            medicineIds.forEach((id, index) => {

                const amount =
                    parseFloat(
                        amounts[index]
                    ) || 0;

                // =====================
                // ITEM OBAT
                // =====================

                db.run(
                    `
                    INSERT INTO administration_items
                    (
                        administration_id,
                        medicine_id,
                        amount
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        administrationId,
                        id,
                        amount
                    ],
                    (err) => {

                        if (err) {
                            console.error(err);
                        }

                    }
                );

                // =====================
                // KURANGI STOK
                // =====================

                db.run(
                    `
                    UPDATE medicines
                    SET stock = stock - ?
                    WHERE id = ?
                    `,
                    [
                        amount,
                        id
                    ],
                    (err) => {

                        if (err) {
                            console.error(err);
                        }

                    }
                );

                // =====================
                // LOG STOK
                // =====================

                db.run(
                    `
                    INSERT INTO stock_transactions
                    (
                        medicine_id,
                        quantity,
                        transaction_type,
                        note,
                        created_at
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        datetime('now')
                    )
                    `,
                    [
                        id,
                        amount,
                        "OUT",
                        "Pemberian obat"
                    ],
                    (err) => {

                        if (err) {
                            console.error(err);
                        }

                    }
                );

            });

            res.redirect("/history");

        }
    );

});

module.exports = router;