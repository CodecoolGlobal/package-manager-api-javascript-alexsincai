const express = require("express");
const fs = require("fs");
const path = require("path");

const fileReader = require("./fileReader");
const filePath = path.join(`${__dirname}/pkgs.json`);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = 9001;

app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});

app.get("/example", async (req, res) => {
  const fileData = await fileReader(filePath);

  console.log(fileData.toString());
	res.send(fileData.toString())
});

app.listen(port, _ => console.log(`http://127.0.0.1:${port}`));