const express = require("express");
const router = express.Router();

const db = require("../config/database");

//halaman daftar obat
router.get("/", (req,res)=>{

db.all(
`
SELECT *
FROM medicines
ORDER BY name
`,
[],
(err, rows)=>{

res.render(
"medicines",
{
medicines: rows
}
);

});

});

//tambahkan obat
router.post("/add",(req,res)=>{

const {
name,
stock,
unit,
reorder_level
} = req.body;

db.run(
`
INSERT INTO medicines
(
name,
stock,
unit,
reorder_level
)
VALUES
(?,?,?,?)
`,
[
name,
stock,
unit,
reorder_level
],
()=>{
res.redirect("/medicines");
}
);

});

//form edit
router.get("/edit/:id",(req,res)=>{

db.get(
`
SELECT *
FROM medicines
WHERE id=?
`,
[
req.params.id
],
(err,row)=>{

res.render(
"medicine-edit",
{
medicine: row
}
);

});

});

//updateobat
router.post("/update/:id",(req,res)=>{

const {
name,
stock,
unit,
reorder_level
} = req.body;

db.run(
`
UPDATE medicines
SET
name=?,
stock=?,
unit=?,
reorder_level=?
WHERE id=?
`,
[
name,
stock,
unit,
reorder_level,
req.params.id
],
()=>{
res.redirect("/medicines");
}
);

});

//hapusobat
router.post("/delete/:id",(req,res)=>{

db.run(
`
DELETE FROM medicines
WHERE id=?
`,
[
req.params.id
],
()=>{
res.redirect("/medicines");
}
);

});

module.exports = router;