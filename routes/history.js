const express = require("express");

const router = express.Router();

const db = require("../config/database");

const adminOnly =
require(
"../middleware/adminOnly"
);


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
    "/delete/:id", adminOnly,
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
                    DELETE FROM stock_transactions
                    WHERE reference_id = ?
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


//edit

router.get(
"/edit/:id", adminOnly,
(req,res)=>{

    db.all(
    `
    SELECT
        i.id,
        i.medicine_id,
        i.amount,
        m.name
    FROM administration_items i
    JOIN medicines m
    ON m.id = i.medicine_id
    WHERE administration_id = ?
    `,
    [
        req.params.id
    ],
    (err,items)=>{

        db.get(
        `
        SELECT *
        FROM administrations
        WHERE id = ?
        `,
        [
            req.params.id
        ],
        (err,record)=>{

            db.all(
            `
            SELECT *
            FROM medicines
            ORDER BY name
            `,
            [],
            (err,medicines)=>{

                res.render(
                "history-edit",
                {
                    record,
                    items,
                    medicines
                }
                );

            });

        });

    });

});

//save edit

router.post(
"/edit/:id", adminOnly,
(req,res)=>{

    const {
        administered_at,
        note
    } = req.body;

    let medicineIds =
    req.body.medicine_id;

    let amounts =
    req.body.amount;

    if(!Array.isArray(medicineIds)){
        medicineIds = [medicineIds];
    }

    if(!Array.isArray(amounts)){
        amounts = [amounts];
    }

    const administrationId =
    req.params.id;

    const validItems = [];

    for(let i=0;i<medicineIds.length;i++){

        const amount =
        parseFloat(amounts[i]);

        if(
            !isNaN(amount) &&
            amount > 0
        ){
            validItems.push({
                medicine_id:
                medicineIds[i],

                amount
            });
        }

    }

    if(validItems.length === 0){

        return res.send(
            "Minimal harus ada 1 obat."
        );

    }

    db.all(
    `
    SELECT
        medicine_id,
        amount
    FROM administration_items
    WHERE administration_id = ?
    `,
    [
        administrationId
    ],
    (err, oldItems)=>{

        if(err){

            console.error(err);

            return res.redirect(
                "/history"
            );

        }

        // ====================
        // Kembalikan stok lama
        // ====================

        oldItems.forEach(
        item=>{

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

        // ====================
        // Cek stok cukup
        // ====================

        db.all(
        `
        SELECT
            id,
            stock,
            name
        FROM medicines
        `,
        [],
        (err, medicines)=>{

            if(err){

                console.error(err);

                return res.redirect(
                    "/history"
                );

            }

            const stockMap = {};

            medicines.forEach(
            m=>{

                stockMap[m.id] = m;

            });

            for(
                const item
                of validItems
            ){

                const medicine =
                stockMap[
                    item.medicine_id
                ];

                if(
                    !medicine
                ){

                    return res.send(
                        "Obat tidak ditemukan."
                    );

                }

                if(
                    medicine.stock <
                    item.amount
                ){

                    return res.send(
                        `Stok ${medicine.name} tidak mencukupi.`
                    );

                }

            }

            // ====================
            // Hapus data lama
            // ====================

            db.run(
            `
            DELETE FROM administration_items
            WHERE administration_id = ?
            `,
            [
                administrationId
            ]
            );

            db.run(
            `
            DELETE FROM stock_transactions
            WHERE reference_id = ?
            `,
            [
                administrationId
            ]
            );

            // ====================
            // Update header
            // ====================

            db.run(
            `
            UPDATE administrations
            SET
                administered_at = ?,
                note = ?
            WHERE id = ?
            `,
            [
                administered_at,
                note,
                administrationId
            ],
            ()=>{

                let pending =
                validItems.length;

                validItems.forEach(
                item=>{

                    db.run(
                    `
                    INSERT INTO administration_items
                    (
                        administration_id,
                        medicine_id,
                        amount
                    )
                    VALUES
                    (?,?,?)
                    `,
                    [
                        administrationId,
                        item.medicine_id,
                        item.amount
                    ]
                    );

                    db.run(
                    `
                    UPDATE medicines
                    SET stock =
                    stock - ?
                    WHERE id = ?
                    `,
                    [
                        item.amount,
                        item.medicine_id
                    ]
                    );

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
                        'Pemberian obat',
                        datetime('now','localtime')
                    )
                    `,
                    [
                        item.medicine_id,
                        item.amount,
                        administrationId
                    ],
                    ()=>{

                        pending--;

                        if(
                            pending === 0
                        ){

                            res.redirect(
                                "/history"
                            );

                        }

                    });

                });

            });

        });

    });

});

module.exports = router;