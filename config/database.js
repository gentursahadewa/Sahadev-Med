const sqlite3 = require("sqlite3").verbose();

const dbPath = process.env.DB_PATH || "db/database.db";
const db = new sqlite3.Database(dbPath);

db.serialize(() => {

  db.run(`
  CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      stock REAL DEFAULT 0,
      unit TEXT DEFAULT 'tablet',
      reorder_level REAL DEFAULT 10
  )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS administrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      administered_at TEXT NOT NULL,
      note TEXT
  )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS administration_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      administration_id INTEGER,
      medicine_id INTEGER,
      amount REAL,

      FOREIGN KEY(administration_id)
      REFERENCES administrations(id),

      FOREIGN KEY(medicine_id)
      REFERENCES medicines(id)
  )
  `);

});

db.run(`
CREATE TABLE IF NOT EXISTS stock_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    medicine_id INTEGER NOT NULL,

    quantity REAL NOT NULL,

    transaction_type TEXT NOT NULL,

    note TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY(medicine_id)
    REFERENCES medicines(id)
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS stock_transactions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    medicine_id INTEGER NOT NULL,

    quantity REAL NOT NULL,

    transaction_type TEXT NOT NULL,

    reference_id INTEGER,

    note TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY(medicine_id)
    REFERENCES medicines(id)

)
`);

db.run(`
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE,
    subscription TEXT NOT NULL,
    created_at TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS users(

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT UNIQUE,

    password TEXT

)
`);

const bcrypt =
require(
"bcrypt"
);

db.get(
`
SELECT COUNT(*) total
FROM users
`,
[],
async (
err,
row
)=>{

    if(
        row.total === 0
    ){
        
        const hash =
        await bcrypt.hash(
            process.env.DEFAULT_ADMIN_PASSWORD,
            10
        );

        db.run(
        `
        INSERT INTO users
        (
            username,
            password
        )
        VALUES
        (
            ?,
            ?
        )
        `,
        [
            "admin",
            hash
        ]
        );

        console.log(
        "Admin default dibuat"
        );

    }

});



module.exports = db;
