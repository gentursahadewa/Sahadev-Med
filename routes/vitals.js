const express = require("express");

const router = express.Router();

const db = require("../config/database");

router.get("/", (req, res) => {

    const days =
    parseInt(req.query.days);

    const filterDays =
    isNaN(days)
    ? 30
    : days;

    let whereClause = "";

    if(filterDays > 0){

        whereClause =
        `
        WHERE datetime(measured_at)
        >= datetime('now', '-${filterDays} day')
        `;
    }

    db.all(
        `
        SELECT *
        FROM vitals
        ${whereClause}
        ORDER BY datetime(measured_at) DESC
        `,
    [],
    (err, rows) => {

        if(err){

            console.error(err);

            return res.render(
                "vitals",
                {
                    rows: [],
                    chartData: []
                }
            );

        }

        const glucoseChartData =
        rows
        .filter(
        x => x.blood_glucose !== null
        )
        .reverse();

        const bloodPressureChartData =
        rows
        .filter(
        x =>
        x.systolic !== null &&
        x.diastolic !== null
        )
        .reverse();

        const successId =
        req.query.id;
        if(successId){

            db.get(
            `
            SELECT *
            FROM vitals
            WHERE id = ?
            `,
            [successId],
            (err,lastSaved)=>{

                res.render(
                "vitals",
                {
                    rows,
                    glucoseChartData,
                    bloodPressureChartData,
                    success:
                    req.query.success,
                    lastSaved, 
                    days: filterDays
                }
                );

            });

        }else{

            res.render(
            "vitals",
            {
                rows,
                glucoseChartData,
                bloodPressureChartData,
                success:null,
                lastSaved:null,
                days: filterDays
            }
            );

        }

    }
    );

});

router.post("/save", (req, res) => {

    const {

        measured_at,

        blood_glucose,

        systolic,

        diastolic,

        note

    } = req.body;

    db.run(
        `
        INSERT INTO vitals
        (
            measured_at,
            blood_glucose,
            systolic,
            diastolic,
            note
        )
        VALUES
        (?,?,?,?,?)
        `,
        [
            measured_at,
            blood_glucose || null,
            systolic || null,
            diastolic || null,
            note
        ],
        function(){

            res.redirect(
            `/vitals?success=1&id=${this.lastID}`
            );

        }
    );

});

router.get(
"/glucose",
(req,res)=>{

    db.all(
    `
    SELECT
        id,
        measured_at,
        blood_glucose,
        note
    FROM vitals
    WHERE blood_glucose IS NOT NULL
    ORDER BY datetime(measured_at) DESC
    `,
    [],
    (err, rows)=>{

        db.get(
        `
        SELECT
            MAX(blood_glucose) highest,
            MIN(blood_glucose) lowest,
            ROUND(AVG(blood_glucose),1) average
        FROM vitals
        WHERE blood_glucose IS NOT NULL
        `,
        [],
        (err, stats)=>{

            res.render(
            "glucose-detail",
            {
                rows,
                stats
            }
            );

        });

    });

});

router.get(
"/blood-pressure",
(req,res)=>{

    db.all(
    `
    SELECT
        id,
        measured_at,
        systolic,
        diastolic,
        note
    FROM vitals
    WHERE systolic IS NOT NULL
    AND diastolic IS NOT NULL
    ORDER BY datetime(measured_at) DESC
    `,
    [],
    (err, rows)=>{

        if(err){

            console.error(err);

            return res.redirect(
            "/vitals"
            );

        }

        db.get(
        `
        SELECT
            ROUND(AVG(systolic),1)
            avg_systolic,

            ROUND(AVG(diastolic),1)
            avg_diastolic

        FROM vitals

        WHERE systolic IS NOT NULL
        AND diastolic IS NOT NULL
        `,
        [],
        (err, averageStats)=>{

            db.get(
            `
            SELECT
                systolic,
                diastolic
            FROM vitals
            WHERE systolic IS NOT NULL
            AND diastolic IS NOT NULL
            ORDER BY systolic DESC
            LIMIT 1
            `,
            [],
            (err, highest)=>{

                db.get(
                `
                SELECT
                    systolic,
                    diastolic
                FROM vitals
                WHERE systolic IS NOT NULL
                AND diastolic IS NOT NULL
                ORDER BY systolic ASC
                LIMIT 1
                `,
                [],
                (err, lowest)=>{

                    res.render(
                    "blood-pressure-detail",
                    {
                        rows,

                        stats:{

                            avg_systolic:
                            averageStats?.avg_systolic,

                            avg_diastolic:
                            averageStats?.avg_diastolic,

                            highest_systolic:
                            highest?.systolic,

                            highest_diastolic:
                            highest?.diastolic,

                            lowest_systolic:
                            lowest?.systolic,

                            lowest_diastolic:
                            lowest?.diastolic

                        }

                    });

                });

            });

        });

    });

});


router.get(
"/glucose/edit/:id",
(req,res)=>{

    db.get(
    `
    SELECT *
    FROM vitals
    WHERE id = ?
    `,
    [
        req.params.id
    ],
    (err,row)=>{

        if(err || !row){

            return res.redirect(
            "/vitals/glucose"
            );

        }

        res.render(
        "glucose-edit",
        {
            row
        }
        );

    });

});

router.post(
"/glucose/edit/:id",
(req,res)=>{

    const {
        measured_at,
        blood_glucose,
        note
    } = req.body;

    db.run(
    `
    UPDATE vitals
    SET
        measured_at = ?,
        blood_glucose = ?,
        note = ?
    WHERE id = ?
    `,
    [
        measured_at,
        blood_glucose || null,
        note,
        req.params.id
    ],
    ()=>{

        res.redirect(
        "/vitals/glucose"
        );

    });

});

router.post(
"/glucose/delete/:id",
(req,res)=>{

    db.run(
    `
    DELETE FROM vitals
    WHERE id = ?
    `,
    [
        req.params.id
    ],
    ()=>{

        res.redirect(
        "/vitals/glucose"
        );

    });

});

router.get(
"/blood-pressure/edit/:id",
(req,res)=>{

    db.get(
    `
    SELECT *
    FROM vitals
    WHERE id = ?
    `,
    [
        req.params.id
    ],
    (err,row)=>{

        if(err || !row){

            return res.redirect(
            "/vitals/blood-pressure"
            );

        }

        res.render(
        "blood-pressure-edit",
        {
            row
        }
        );

    });

});

router.post(
"/blood-pressure/edit/:id",
(req,res)=>{

    const {
        measured_at,
        systolic,
        diastolic,
        note
    } = req.body;

    db.run(
    `
    UPDATE vitals
    SET
        measured_at = ?,
        systolic = ?,
        diastolic = ?,
        note = ?
    WHERE id = ?
    `,
    [
        measured_at,
        systolic || null,
        diastolic || null,
        note,
        req.params.id
    ],
    ()=>{

        res.redirect(
        "/vitals/blood-pressure"
        );

    });

});

router.post(
"/blood-pressure/delete/:id",
(req,res)=>{

    db.run(
    `
    DELETE FROM vitals
    WHERE id = ?
    `,
    [
        req.params.id
    ],
    ()=>{

        res.redirect(
        "/vitals/blood-pressure"
        );

    });

});

module.exports = router;