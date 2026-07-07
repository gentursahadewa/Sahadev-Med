require("dotenv").config();

const requiredEnv = [

    "SESSION_SECRET",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY"

];

for(
    const key
    of requiredEnv
){

    if(
        !process.env[key]
    ){

        console.error(
        `ENV ${key} belum diisi`
        );

        process.exit(1);

    }

}

const express = require("express");

const app = express();

const session =
require(
"express-session"
);

app.use(
session({

    secret:
    process.env.SESSION_SECRET,

    resave:false,

    saveUninitialized:false,

    cookie:{

        maxAge:
        1000 *
        60 *
        60 *
        24 *
        30

    }

})
);

require("./config/database");

app.use((req,res,next)=>{

    res.locals.currentPath =
    req.path;

    res.locals.vapidPublicKey =
    process.env.VAPID_PUBLIC_KEY;

    res.locals.isLoggedIn =
    !!req.session.user;

    next();

});

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");

app.locals.VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

const dashboardRoute =
require("./routes/dashboard");

app.use(
"/",
dashboardRoute
);

const medicineRoute =
require("./routes/medicines");

app.use(
"/medicines",
medicineRoute
);

const recordRoute =
require("./routes/records");

app.use(
"/record",
recordRoute
);

const historyRoute =
require("./routes/history");

app.use(
"/history",
historyRoute
);

const stockRoute =
require("./routes/stock");

app.use(
"/stock",
stockRoute
);

const stockLogRoute =
require("./routes/stock-log");

app.use(
"/stock-log",
stockLogRoute
);

const exportRoute =
require("./routes/export");

app.use(
"/export",
exportRoute
);

const vitalsRoutes =
require("./routes/vitals");

app.use(
    "/vitals",
    vitalsRoutes
);

app.use(
"/push",
require(
"./routes/push"
)
);

const authRoute =
require(
"./routes/auth"
);

app.use(
"/",
authRoute
);
