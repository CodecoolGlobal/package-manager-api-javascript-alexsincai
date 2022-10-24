const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const router = require("./packRouter");

const port = 9001;

express()
    .use(express.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .get("/", (req, res) => {
        res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
    })
    .use("/api/package", router)
    .listen(port, (_) => console.log(`http://127.0.0.1:${port}`));
