const express = require("express");
const router = express.Router();

const db = require("../config/database");

const adminOnly =
require(
"../middleware/adminOnly"
);

router.get("/", (req,res)=>{

db.all(
`
SELECT *
FROM medicines
ORDER BY name
`,
[],
(err, medicines)=>{

res.render(
"stock",
{
medicines
}
);

});

});

router.post("/add", adminOnly,(req,res)=>{

const {
medicine_id,
quantity,
note
} = req.body;

db.run(
`
UPDATE medicines
SET stock =
stock + ?
WHERE id = ?
`,
[
quantity,
medicine_id
]
);

db.run(
`
INSERT INTO stock_transactions
(
medicine_id,
quantity,
transaction_type,
note,
created_at
)
VALUES
(
?,
?,
'IN',
?,
datetime('now','localtime')
)
`,
[
medicine_id,
quantity,
note
],
()=>{
res.redirect("/stock");
}
);

});

module.exports = router;