# Sahadev Med

Aplikasi pencatatan obat dan pemantauan kesehatan berbasis web yang dibuat menggunakan Node.js, Express, SQLite, EJS, Bootstrap, dan Chart.js.

Sahadev Med membantu pengguna mencatat pemberian obat, memantau stok, melakukan restock, mencatat gula darah dan tekanan darah, melihat riwayat kesehatan, serta mengekspor seluruh data ke Microsoft Excel.


<p align="center">
  <img width="180" alt="Mobile View" src="https://github.com/user-attachments/assets/985e511b-8ffd-42b9-8eff-e486f98f7730" />
</p>

---

## Fitur

### Dashboard

- Total jenis obat
- Total pemberian obat
- Jumlah obat dengan stok menipis
- Daftar obat yang perlu direstock
- Grafik pemberian obat 7 hari terakhir
- Informasi gula darah terakhir
- Informasi tekanan darah terakhir

---

### Pencatatan Obat

- Mencatat beberapa obat dalam satu waktu
- Default jumlah obat otomatis 1
- Menambahkan catatan pemberian obat
- Tombol waktu otomatis (Sekarang)
- Otomatis mengurangi stok obat
- Otomatis mencatat log stok keluar

---

### Riwayat Pemberian Obat

- Melihat seluruh riwayat pemberian obat
- Detail obat yang diberikan
- Edit data pemberian obat
- Hapus data pemberian obat
- Stok otomatis disesuaikan saat edit atau hapus data

---

### Cek Kesehatan

Mencatat data kesehatan pasien secara terpusat.

#### Gula Darah

- Catat gula darah sewaktu
- Catat gula darah puasa
- Riwayat gula darah
- Statistik:
  - Nilai tertinggi
  - Nilai terendah
  - Nilai rata-rata
- Grafik perkembangan gula darah
- Edit data
- Hapus data

#### Tekanan Darah

- Catat sistolik dan diastolik
- Riwayat tekanan darah
- Statistik:
  - Tekanan darah tertinggi
  - Tekanan darah terendah
  - Rata-rata tekanan darah
- Grafik perkembangan tekanan darah
- Edit data
- Hapus data

---

### Master Obat

- Tambah obat
- Edit obat
- Hapus obat
- Menentukan batas minimum stok
- Pengaturan satuan obat

Contoh satuan:

- Tablet
- Kapsul
- Botol
- Sachet
- Ampul

---

### Restock

- Menambahkan stok obat
- Menyimpan catatan restock
- Otomatis mencatat log stok masuk

---

### Log Stok

- Riwayat stok masuk
- Riwayat stok keluar
- Waktu transaksi
- Jumlah perubahan stok
- Catatan transaksi

---

### Export Excel

Mengekspor seluruh data ke file Microsoft Excel (.xlsx).

#### Sheet Timeline Lengkap

Menggabungkan seluruh aktivitas berdasarkan waktu:

- Pemberian obat
- Gula darah
- Tekanan darah

Kolom:

- Tanggal
- Waktu
- Obat
- Gula Darah
- Tensi
- Catatan Obat
- Catatan Kesehatan

#### Sheet Riwayat Pemberian Obat

- Tanggal
- Waktu
- Obat dan dosis
- Catatan

#### Sheet Riwayat Kesehatan

- Tanggal
- Waktu
- Gula darah
- Tekanan darah
- Catatan

#### Sheet Log Stok

- Tanggal
- Waktu
- Obat
- Jenis transaksi
- Jumlah
- Catatan

#### Sheet Stok Saat Ini

- Nama obat
- Stok saat ini
- Satuan
- Minimum stok

---

### Progressive Web App (PWA)

- Install ke Android melalui Chrome
- Shortcut aplikasi di layar utama
- Ikon aplikasi khusus
- Tampilan seperti aplikasi native

---

## Teknologi

### Backend

- Node.js
- Express.js
- SQLite3

### Frontend

- EJS
- Bootstrap 5
- Bootstrap Icons
- Chart.js

### Export Data

- ExcelJS

---

## Struktur Data

### Obat

- Nama obat
- Stok
- Satuan
- Minimum stok

### Pemberian Obat

- Tanggal dan waktu
- Daftar obat
- Jumlah obat
- Catatan

### Kesehatan

- Gula darah
- Tekanan darah
- Catatan pemeriksaan

---

## Tujuan

Sahadev Med dibuat untuk membantu pencatatan obat dan pemantauan kesehatan secara sederhana, cepat, dan mudah digunakan, terutama untuk penggunaan pribadi maupun keluarga.

---

## Lisensi

MIT License* Bootstrap Icons
* ExcelJS
* Chart.js

---

## Persyaratan

Pastikan komputer telah terinstall:

### Node.js

Download:

https://nodejs.org

Disarankan menggunakan versi LTS.

Cek instalasi:

```bash
node -v
npm -v
```

---

## Instalasi

Clone repository:

```bash
git clone https://github.com/gentursahadewa/Sahadev-Med.git
```

Masuk ke folder project:

```bash
cd Sahadev-Med
```

Install dependency:

```bash
npm install
```

---

## Menjalankan Program

Menjalankan secara normal:

```bash
npm start
```

atau:

```bash
node app.js
```

Jika menggunakan nodemon:

```bash
npm install -g nodemon
nodemon app.js
```

---

## Membuka Aplikasi

Setelah server berjalan:

```text
http://localhost:3000
```

atau sesuai port yang digunakan pada aplikasi.

---

## Struktur Project

```text
Sahadev-Med
│
├── config
│   └── database.js
│
├── public
│   ├── css
│   ├── js
│   └── images
│
├── routes
│   ├── dashboard.js
│   ├── medicines.js
│   ├── records.js
│   ├── history.js
│   ├── stock.js
│   ├── stock-log.js
│   └── export.js
│
├── views
│   ├── partials
│   ├── dashboard.ejs
│   ├── medicines.ejs
│   ├── records.ejs
│   ├── history.ejs
│   ├── stock.ejs
│   └── stock-log.ejs
│
├── database.db
├── app.js
├── package.json
└── README.md
```

---

## Database

Project menggunakan SQLite.

File database:

```text
database.db
```

Database akan otomatis digunakan oleh aplikasi saat dijalankan.

## Export Data

Menu Export Excel menghasilkan:

### Sheet 1

Riwayat Pemberian

### Sheet 2

Log Stok

### Sheet 3

Stok Saat Ini

Format file:

```text
sahadev-med-YYYY-MM-DD.xlsx
```

---

## Lisensi

MIT License

---

## Author

Gentur Sahadewa

Sahadev Med © 2026
All Rights Reserved
