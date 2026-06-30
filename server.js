const express = require("express");

const app = express();

require("./config/database");

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.set("view engine", "ejs");



const PORT = 3000;

app.listen(PORT, ()=>{
    console.log(
        `Server berjalan di http://localhost:${PORT}`
    );
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
