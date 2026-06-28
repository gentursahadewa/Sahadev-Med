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
        // WORKBOOK
        // ======================

        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Sahadev Med";
        workbook.created = new Date();

        // ==================================================
        // SHEET 1 - RIWAYAT PEMBERIAN
        // ==================================================

 const historySheet =
    workbook.addWorksheet(
        "Riwayat Pemberian"
    );

        historySheet.columns = [
            {
                header: "Tanggal & Waktu",
                key: "tanggal",
                width: 22
            },
            {
                header: "Obat & Dosis / Cek Kesehatan",
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

            historySheet.addRow({

                tanggal:
                    row.administered_at
                        ? row.administered_at
                            .replace("T", " ")
                        : "",

                medicines:
                    row.medicines,

                note:
                    row.note || ""

            });

        });

        historySheet.getRow(1).font = {
            bold: true
        };

        historySheet.autoFilter = {
            from: "A1",
            to: "C1"
        };

        // ==================================================
        // SHEET 2 - LOG STOK
        // ==================================================

        const stockSheet =
            workbook.addWorksheet("Log Stok");

        stockSheet.columns = [
            {
                header: "Tanggal",
                key: "tanggal",
                width: 22
            },
            {
                header: "Obat",
                key: "name",
                width: 30
            },
            {
                header: "Jenis",
                key: "transaction_type",
                width: 15
            },
            {
                header: "Qty",
                key: "quantity",
                width: 15
            },
            {
                header: "Catatan",
                key: "note",
                width: 40
            }
        ];

        stockLogs.forEach(row => {

            stockSheet.addRow({

                tanggal:
                    row.created_at
                        ? row.created_at
                            .replace("T", " ")
                        : "",

                name: row.name,

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
            to: "E1"
        };

        // ==================================================
        // SHEET 3 - STOK SAAT INI
        // ==================================================

        const medicineSheet =
            workbook.addWorksheet("Stok Saat Ini");

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

            medicineSheet.addRow(row);

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