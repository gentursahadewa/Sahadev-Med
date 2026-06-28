# Sahadev Med

Aplikasi pencatatan pemberian obat berbasis web yang dibuat menggunakan Node.js, Express, SQLite, Bootstrap, dan EJS.

Sahadev Med membantu pengguna mencatat pemberian obat, memantau stok, melakukan restock, melihat riwayat penggunaan obat, serta mengekspor data ke Excel.

---

## Fitur

### Dashboard

* Total jenis obat
* Total pemberian obat
* Jumlah obat dengan stok menipis
* Daftar obat yang perlu direstock
* Grafik pemberian obat

### Pencatatan Obat

* Mencatat beberapa obat dalam satu waktu
* Menambahkan catatan pemberian
* Otomatis mengurangi stok obat

### Riwayat Pemberian

* Melihat seluruh riwayat pemberian obat
* Detail obat yang diberikan
* Menghapus riwayat dan mengembalikan stok

### Master Obat

* Tambah obat
* Edit obat
* Hapus obat
* Menentukan batas minimum stok

### Restock

* Menambahkan stok obat
* Mencatat histori restock

### Log Stok

* Riwayat keluar masuk stok
* Monitoring perubahan stok

### Export Excel

* Riwayat pemberian obat
* Log stok
* Stok saat ini
* Format XLSX

---

## Teknologi

* Node.js
* Express.js
* SQLite3
* EJS
* Bootstrap 5
* Bootstrap Icons
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

---

## Deploy dengan Cloudflare Tunnel

Menjalankan server:

```bash
npm start
```

Expose ke internet:

```bash
cloudflared tunnel run nama-tunnel
```

Contoh:

```bash
cloudflared tunnel run navidrome
```

Domain:

```text
https://med.sahadev.my.id
```

dapat diarahkan ke localhost menggunakan Cloudflare Tunnel.

---

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
