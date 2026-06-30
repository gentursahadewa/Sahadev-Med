const express = require("express");
const router = express.Router();

const ExcelJS = require("exceljs");

const db = require("../config/database");

router.get("/", async (req, res) => {

    try {

        // ======================
        // RIWAYAT PEMBERIAN
        // ======================

        const histories = await new Promise((resolve, reject) => {

            db.all(
                `
                SELECT

                    a.administered_at,

                    GROUP_CONCAT(

                        m.name ||

                        ' (' ||

                        CAST(i.amount AS INTEGER) ||

                        ' ' ||

                        COALESCE(m.unit,'')

                        || ')',

                        ', '

                    ) AS medicines,

                    a.note

                FROM administrations a

                LEFT JOIN administration_items i
                    ON i.administration_id = a.id

                LEFT JOIN medicines m
                    ON m.id = i.medicine_id

                GROUP BY a.id

                ORDER BY datetime(a.administered_at) ASC
                `,
                [],
                (err, rows) => {

                    if (err) {

                        reject(err);

                        return;

                    }

                    resolve(rows);

                }
            );

        });

        // ======================
        // RIWAYAT KESEHATAN
        // ======================

        const vitals = await new Promise((resolve, reject) => {

            db.all(
                `
                SELECT

                    measured_at,

                    blood_glucose,

                    systolic,

                    diastolic,

                    note

                FROM vitals

                ORDER BY datetime(measured_at) ASC
                `,
                [],
                (err, rows) => {

                    if (err) {

                        reject(err);

                        return;

                    }

                    resolve(rows);

                }
            );

        });

        // ======================
        // LOG STOK
        // ======================

        const stockLogs = await new Promise((resolve, reject) => {

            db.all(
                `
                SELECT

                    s.created_at,

                    m.name,

                    s.transaction_type,

                    s.quantity,

                    s.note

                FROM stock_transactions s

                JOIN medicines m
                    ON m.id = s.medicine_id

                ORDER BY datetime(s.created_at) ASC
                `,
                [],
                (err, rows) => {

                    if (err) {

                        reject(err);

                        return;

                    }

                    resolve(rows);

                }

            );

        });

        // ======================
        // STOK SAAT INI
        // ======================

        const medicines = await new Promise((resolve, reject) => {

            db.all(
                `
                SELECT

                    name,

                    stock,

                    unit,

                    reorder_level

                FROM medicines

                ORDER BY name
                `,
                [],
                (err, rows) => {

                    if (err) {

                        reject(err);

                        return;

                    }

                    resolve(rows);

                }

            );

        });

        // ======================
        // TIMELINE LENGKAP
        // ======================
        const timelineMap = {};

        // Pemberian obat
        histories.forEach(row => {

            const dt = new Date(row.administered_at);

            const key =
            row.administered_at
            .substring(0,16);

                if(!timelineMap[key]){

                    timelineMap[key] = {

                        datetime: key,

                        obat: "",

                        gula_darah: "",

                        tensi: "",

                        catatan_obat: "",

                        catatan_kesehatan: ""

                    };

                }

                timelineMap[key].obat =
                row.medicines || "";

                timelineMap[key].catatan_obat =
                row.note || "";

        });

        // Cek kesehatan
        vitals.forEach(row => {

            const dt =
            new Date(row.measured_at);

            const key =
            row.measured_at
            .substring(0,16);

            if(!timelineMap[key]){

                timelineMap[key] = {

                    datetime: key,

                    obat: "",

                    gula_darah: "",

                    tensi: "",

                    catatan_obat: "",

                    catatan_kesehatan: ""

                };

            }

            if(row.blood_glucose !== null){

                timelineMap[key].gula_darah =
                row.blood_glucose;

            }

            if(
                row.systolic !== null &&
                row.diastolic !== null
            ){

                timelineMap[key].tensi =
                `${row.systolic}/${row.diastolic}`;

            }

            timelineMap[key].catatan_kesehatan =
            row.note || "";
        });
        const timeline =
        Object.values(
            timelineMap
        );
        timeline.sort(
        (a,b)=>
        new Date(a.datetime) -
        new Date(b.datetime)
        );

        // ======================
        // WORKBOOK
        // ======================

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Sahadev Med";

        workbook.created =
            new Date();

                    // ==================================================
        // SHEET 1 - TIMELINE LENGKAP
        // ==================================================

        const timelineSheet =
            workbook.addWorksheet(
                "Timeline Lengkap"
            );

        timelineSheet.columns = [

        {
            header: "Tanggal",
            key: "tanggal",
            width: 15
        },

        {
            header: "Waktu",
            key: "waktu",
            width: 12
        },

        {
            header: "Obat",
            key: "obat",
            width: 50
        },

        {
            header: "Gula Darah (mg/dL)",
            key: "gula_darah",
            width: 20
        },

        {
            header: "Tensi (mmHg)",
            key: "tensi",
            width: 18
        },

        {
            header: "Catatan Obat",
            key: "catatan_obat",
            width: 40
        },

        {
            header: "Catatan Cek Kesehatan",
            key: "catatan_kesehatan",
            width: 40
        }

        ];

        timeline.forEach(row => {

            const dt =
            new Date(
                row.datetime
            );

            timelineSheet.addRow({

                tanggal:
                dt.toLocaleDateString(
                    "id-ID"
                ),

                waktu:
                dt.toLocaleTimeString(
                    "id-ID",
                    {
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                ).replace(":","."),

                obat:
                row.obat,

                gula_darah:
                row.gula_darah,

                tensi:
                row.tensi,

                catatan_obat:
                row.catatan_obat,

                catatan_kesehatan:
                row.catatan_kesehatan

            });

        });
        timelineSheet.getRow(1).font = {
            bold: true
        };

        timelineSheet.autoFilter = {
            from: "A1",
            to: "G1"
        };

        // ==================================================
        // SHEET 2 - RIWAYAT PEMBERIAN
        // ==================================================

        const historySheet =
            workbook.addWorksheet(
                "Riwayat Pemberian"
            );

            historySheet.columns = [
            {
                header: "Tanggal",
                key: "tanggal",
                width: 15
            },
            {
                header: "Waktu",
                key: "waktu",
                width: 10
            },
            {
                header: "Obat",
                key: "medicines",
                width: 80
            },
            {
                header: "Catatan",
                key: "note",
                width: 40
            }
            ];

        histories.forEach(row => {

            const dt = new Date(row.administered_at);

            historySheet.addRow({

                tanggal:
                dt.toLocaleDateString("id-ID"),

                waktu:
                dt.toLocaleTimeString(
                    "id-ID",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ).replace(":", "."),

                medicines:
                row.medicines || "",

                note:
                row.note || ""

            });

        });

        historySheet.getRow(1).font = {
            bold: true
        };

        historySheet.autoFilter = {
            from: "A1",
            to: "D1"
        };

        // ==================================================
        // SHEET 3 - RIWAYAT KESEHATAN
        // ==================================================

        const vitalsSheet =
            workbook.addWorksheet(
                "Riwayat Kesehatan"
            );

        vitalsSheet.columns = [
        {
            header:"Tanggal",
            key:"tanggal",
            width:15
        },
        {
            header:"Waktu",
            key:"waktu",
            width:10
        },
        {
            header:"Gula Darah (mg/dL)",
            key:"blood_glucose",
            width:20
        },
        {
            header:"Tensi (mmHg)",
            key:"blood_pressure",
            width:20
        },
        {
            header:"Catatan",
            key:"note",
            width:40
        }
        ];

        vitals.forEach(row => {

            const dt =
            new Date(row.measured_at);

            vitalsSheet.addRow({

                tanggal:
                dt.toLocaleDateString("id-ID"),

                waktu:
                dt.toLocaleTimeString(
                    "id-ID",
                    {
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                ).replace(":", "."),

                blood_glucose:
                row.blood_glucose || "",

                blood_pressure:
                (
                    row.systolic !== null &&
                    row.diastolic !== null
                )
                ? `${row.systolic}/${row.diastolic}`
                : "",

                note:
                row.note || ""

            });

        });

        vitalsSheet.getRow(1).font = {
            bold: true
        };

        vitalsSheet.autoFilter = {
            from: "A1",
            to: "E1"
        };

        // ==================================================
        // SHEET 4 - LOG STOK
        // ==================================================

        const stockSheet =
            workbook.addWorksheet(
                "Log Stok"
            );

            stockSheet.columns = [

            {
                header:"Tanggal",
                key:"tanggal",
                width:15
            },

            {
                header:"Waktu",
                key:"waktu",
                width:10
            },

            {
                header:"Obat",
                key:"name",
                width:30
            },

            {
                header:"Jenis",
                key:"transaction_type",
                width:15
            },

            {
                header:"Qty",
                key:"quantity",
                width:15
            },

            {
                header:"Catatan",
                key:"note",
                width:40
            }

            ];
        stockLogs.forEach(row => {

            const dt =
            new Date(row.created_at);

            stockSheet.addRow({

                tanggal:
                dt.toLocaleDateString("id-ID"),

                waktu:
                dt.toLocaleTimeString(
                    "id-ID",
                    {
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                ).replace(":", "."),

                name:
                row.name,

                transaction_type:
                row.transaction_type,

                quantity:
                row.quantity,

                note:
                row.note || ""

            });
        });

        stockSheet.getRow(1).font = {
            bold: true
        };

        stockSheet.autoFilter = {
            from: "A1",
            to: "F1"
        };

        // ==================================================
        // SHEET 5 - STOK SAAT INI
        // ==================================================

        const medicineSheet =
            workbook.addWorksheet(
                "Stok Saat Ini"
            );

        medicineSheet.columns = [

            {
                header: "Nama Obat",
                key: "name",
                width: 30
            },

            {
                header: "Stok",
                key: "stock",
                width: 15
            },

            {
                header: "Unit",
                key: "unit",
                width: 20
            },

            {
                header: "Minimum Stok",
                key: "reorder_level",
                width: 20
            }

        ];

        medicines.forEach(row => {

            medicineSheet.addRow({

                name:
                    row.name,

                stock:
                    row.stock,

                unit:
                    row.unit,

                reorder_level:
                    row.reorder_level

            });

        });

        medicineSheet.getRow(1).font = {
            bold: true
        };

        medicineSheet.autoFilter = {
            from: "A1",
            to: "D1"
        };

        // ==================================================
        // DOWNLOAD
        // ==================================================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="sahadev-med-${today}.xlsx"`
        );

        await workbook.xlsx.write(res);

        res.end();

    }
    catch (err) {

        console.error(err);

        res.status(500).send(
            "Gagal membuat file Excel"
        );

    }

});

module.exports = router;