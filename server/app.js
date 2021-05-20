//APP Version
const pjson = require("./package.json");

//Requires
const path = require("path");
const express = require("express");
const router = express.Router()
const session = require("express-session");
const cookieParser = require("cookie-parser");

const { lowdbDatabaseSetup } = require("./server_src/services/database/lowdb.database.js");
const { influxInstanceConnect } = require("./server_src/services/database/influxdb.database.js");

// Server Port
const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(express.json());

// Bodyparser
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware

app.use(
    session({
        secret: "supersecret",
        resave: true,
        saveUninitialized: true,
    })
);


const serverStart = async () => {
    //Databases
    await lowdbDatabaseSetup();

    await influxInstanceConnect();

    const PORT = process.env.PORT || 5050;
    app.listen(PORT, () => {
        console.log(`You can now access your server on port: ${PORT}`);
    });
    // Routes

    app.use(express.static('public'));

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });

    app.use("/api", require("./server_src/routes/api.js", { page: "route" }));
};

serverStart();