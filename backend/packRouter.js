const router = require("express").Router();

const path = require("path");
const fileReader = require("./fileReader");
const filePath = path.join(`${__dirname}/pkgs.json`);

const nextId = (packs) =>
    packs
        .map((p) => p.id)
        .sort((a, b) => Math.sign(a - b))
        .pop() + 1;

router
    .use(async (req, res, next) => {
        console.clear();
        const fileData = await fileReader.read(filePath);
        res.locals.data = JSON.parse(fileData.toString());
        next();
    })
    .get("/", (req, res) => {
        res.send(res.locals.data);
    })
    .post("/", async (req, res) => {
        const add = {
            id: nextId(res.locals.data.packages),
            name: req.body.name,
            description: "",
            dependencies: [],
            releases: [
                { date: "2022-06-02", version: "4.19.0" },
                { date: "2022-05-02", version: "4.18.1" },
            ],
        };
        res.locals.data = {
            packages: [...res.locals.data.packages, add],
        };
        res.send(await fileReader.write(filePath, res.locals.data));
    })
    .get("/:id", (req, res) => {
        console.log(nextId(res.locals.data.packages));
        res.send(
            res.locals.data.packages.find(
                (p) => p.id === parseInt(req.params.id)
            )
        );
    })
    .put("/:id", async (req, res) => {
        const pack = res.locals.data.packages.find(
            (p) => p.id === parseInt(req.params.id)
        );

        if (!req.body.release) {
            const latest = pack.releases[pack.releases.length - 1];
            const version = latest.version
                .split(".")
                .map((d) => parseInt(d))
                .map((d, i, a) => (i < a.length - 1 ? d : d + 1))
                .join(".");
            
            console.log(latest, version)
            
            const date = new Date();
            pack.releases.push({
                date: [
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                ].join("-"),
                version,
            });
        }

        res.locals.data = {
            packages: [...res.locals.data.packages, pack],
        };
        res.send(await fileReader.write(filePath, res.locals.data));
    });

module.exports = router;
