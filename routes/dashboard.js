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

                                            db.get(
                                            `
                                            SELECT
                                                blood_glucose,
                                                measured_at
                                            FROM vitals
                                            WHERE blood_glucose IS NOT NULL
                                            ORDER BY datetime(measured_at) DESC
                                            LIMIT 1
                                            `,
                                            [],
                                            (err, latestGlucose) => {

                                                db.get(
                                                `
                                                SELECT
                                                    systolic,
                                                    diastolic,
                                                    measured_at
                                                FROM vitals
                                                WHERE systolic IS NOT NULL
                                                AND diastolic IS NOT NULL
                                                ORDER BY datetime(measured_at) DESC
                                                LIMIT 1
                                                `,
                                                [],
                                                (err, latestBloodPressure) => {

                                                    res.render(
                                                        "dashboard",
                                                        {
                                                            totalMedicines:
                                                                medicineData?.total || 0,

                                                            totalRecords:
                                                                recordData?.total || 0,

                                                            lowStock:
                                                                lowData?.total || 0,

                                                            lowStockItems:
                                                                lowStockItems || [],

                                                            weeklyData:
                                                                weeklyData || [],

                                                            latestGlucose:
                                                                latestGlucose || null,

                                                            latestBloodPressure:
                                                                latestBloodPressure || null
                                                        }
                                                    );

                                                });

                                            });

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