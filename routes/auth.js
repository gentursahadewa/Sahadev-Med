const express =
require("express");

const router =
express.Router();

const bcrypt =
require("bcrypt");

const db =
require("../config/database");
router.get(
"/login",
(req,res)=>{

    res.render(
    "login",
    {
        error:null
    });

});

router.post(
"/login",
(req,res)=>{

    const {
        username,
        password
    } =
    req.body;

    db.get(
    `
    SELECT *
    FROM users
    WHERE username = ?
    `,
    [
        username
    ],
    async (
    err,
    user
    )=>{

        if(!user){

            return res.render(
            "login",
            {
                error:
                "Username salah"
            });

        }

        const match =
        await bcrypt.compare(
            password,
            user.password
        );

        if(!match){

            return res.render(
            "login",
            {
                error:
                "Password salah"
            });

        }

        req.session.user =
        user;

        res.redirect(
        "/"
        );

    });

});

router.get(
"/logout",
(req,res)=>{

    req.session.destroy(()=>{

        res.redirect(
        "/"
        );

    });

});

module.exports =
router;