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
        res.locals.data.packages = res.locals.data.packages.map((p) => {
            if (p.id !== parseInt(req.params.id)) return p;

            console.clear();

            if (!req.body.releases) {
                const latest = p.releases.sort((a, b) =>
                    Math.sign(
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                )[0];

                const version = latest.version
                    .split(".")
                    .map((d) => parseInt(d))
                    .map((d, i, a) => (i < a.length - 1 ? d : d + 1))
                    .join(".");

                const date = new Date();
                p.releases = [
                    {
                        date: [
                            `0${date.getFullYear()}`.slice(-2),
                            `0${date.getMonth()}`.slice(-2),
                            `0${date.getDate()}`.slice(-2),
                        ].join("-"),
                        version,
                    },
                    ...p.releases,
                ];
            } else {
                const { name, description, dependencies, releases } = req.body;

                console.log({
                    name,
                    description,
                    dependencies: dependencies
                        ? JSON.parse(dependencies)
                        : null,
                    releases: releases ? JSON.parse(releases) : null,
                });

                p.name = name ? name : p.name;
                p.description = description ? description : p.description;
                p.dependencies = dependencies
                    ? JSON.parse(dependencies)
                    : p.dependencies;
                p.releases = releases ? JSON.parse(releases) : p.releases;
            }
            return p;
        });

        res.send(await fileReader.write(filePath, res.locals.data));
    })
    .delete("/:id", async (req, res) => {
        res.locals.data.packages = res.locals.data.packages.filter(
            (p) => p.id !== parseInt(req.params.id)
        );
        res.send(await fileReader.write(filePath, res.locals.data));
    });

module.exports = router;
