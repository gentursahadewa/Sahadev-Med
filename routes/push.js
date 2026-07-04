const express = require("express");
const router = express.Router();

const db = require("../config/database");

router.post("/subscribe", (req, res) => {

    const subscription =
    JSON.stringify(req.body);

    db.run(
    `
    INSERT OR REPLACE INTO
    push_subscriptions
    (
        endpoint,
        subscription,
        created_at
    )
    VALUES
    (
        ?,
        ?,
        datetime('now','localtime')
    )
    `,
    [
        req.body.endpoint,
        subscription
    ],
    function(err){

        if(err){

            console.error(
            "SQL ERROR:",
            err
            );

            return res
            .status(500)
            .json(err);

        }


        res.json({
            success:true
        });

    });

});

module.exports = router;