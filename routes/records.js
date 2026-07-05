const express = require("express");

const router = express.Router();

const db = require("../config/database");
const webpush =
require("../config/webpush");

const adminOnly =
require(
"../middleware/adminOnly"
);



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

router.post("/save", adminOnly, (req, res) => {

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
                    reference_id,
                    note,
                    created_at
                )
                VALUES
                (
                    ?,
                    ?,
                    'OUT',
                    ?,
                    ?,
                    datetime('now','localtime')
                )
                `,
                [
                    id,
                    amount,
                    administrationId,
                    'Pemberian obat'
                ]
                );

            });

            db.all(
            `
            SELECT
                id,
                name,
                unit
            FROM medicines
            WHERE id IN (${medicineIds.map(() => "?").join(",")})
            `,
            medicineIds,
            (err, medicinesData)=>{

                const medicineText =
                medicinesData
                .map(m=>{

                    const index =
                    medicineIds.indexOf(
                    String(m.id)
                    );

                    return `${m.name} (${amounts[index]} ${m.unit})`;

                })
                .join("\n");

                db.all(
                `
                SELECT subscription
                FROM push_subscriptions
                `,
                [],
                async (
                err,
                subs
                )=>{

                    if(!err && subs){

                        for(
                        const row
                        of subs
                        ){

                            try{

                                await webpush
                                .sendNotification(

                                    JSON.parse(
                                    row.subscription
                                    ),

                                    JSON.stringify({

                                        title:
                                        "💊 Pemberian Obat Baru",

                                        body:
                                        `${administered_at}\n\n${medicineText}${
                                        note ? `\n\n📝 ${note}` : ""
                                        }`

                                    })

                                );

                            }
                            catch(e){

                                console.error(
                                "Push Error:",
                                e.message
                                );

                            }

                        }

                    }

                    res.redirect(
                    "/history"
                    );

                });

            });

        }
    );

});

module.exports = router;