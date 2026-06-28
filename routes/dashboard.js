const express = require("express");

const router = express.Router();

const db = require("../config/database");

router.get("/", (req, res) => {

    db.get(
        "SELECT COUNT(*) total FROM medicines",
        [],
        (err, medicineData) => {

            db.get(
                "SELECT COUNT(*) total FROM administration_items",
                [],
                (err, recordData) => {

                    db.get(
                        `
                        SELECT COUNT(*) total
                        FROM medicines
                        WHERE stock <= reorder_level
                        `,
                        [],
                        (err, lowData) => {

                            db.all(
                                `
                                SELECT
                                    name,
                                    stock,
                                    unit
                                FROM medicines
                                WHERE stock <= reorder_level
                                ORDER BY stock ASC
                                `,
                                [],
                                (err, lowStockItems) => {

                                    db.all(
                                        `
                                        SELECT
                                            date(administered_at) AS day,
                                            COUNT(*) AS total
                                        FROM administrations
                                        WHERE administered_at >= date('now','-7 day')
                                        GROUP BY day
                                        ORDER BY day
                                        `,
                                        [],
                                        (err, weeklyData) => {

                                            res.render(
                                                "dashboard",
                                                {
                                                    totalMedicines: medicineData.total,
                                                    totalRecords: recordData.total,
                                                    lowStock: lowData.total,
                                                    lowStockItems,
                                                    weeklyData
                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

module.exports = router;