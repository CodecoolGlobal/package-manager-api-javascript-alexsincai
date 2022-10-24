const router = require("express").Router();

const path = require("path");
const fileReader = require("./fileReader");
const filePath = path.join(`${__dirname}/pkgs.json`);

const helpers = {
    nextId: (packs) =>
        packs
            .map((p) => p.id)
            .sort((a, b) => Math.sign(a - b))
            .pop() + 1,
    getLatest: (list) =>
        list
            .map((l) => l)
            .sort((a, b) =>
                Math.sign(
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
            )[0],
    updateVersion: (version) =>
        version
            .split(".")
            .map((d) => parseInt(d))
            .map((d, i, a) => (i < a.length - 1 ? d : d + 1))
            .join("."),
    today: () => {
        const date = new Date();
        return [
            date.getFullYear(),
            `0${date.getMonth()}`.slice(-2),
            `0${date.getDate()}`.slice(-2),
        ].join("-");
    },
    newRelease: (pack) => {
        const latest = helpers.getLatest(pack.releases);
        const version = helpers.updateVersion(latest.version);
        const date = helpers.today();

        pack.releases = [{ date, version }, ...pack.releases];
        return pack;
    },
    update: (pack, body) => {
        const { name, description, dependencies, releases } = body;

        pack.name = name ? name : pack.name;
        pack.description = description ? description : pack.description;
        pack.dependencies = dependencies
            ? JSON.parse(dependencies)
            : pack.dependencies;
        pack.releases = releases ? JSON.parse(releases) : pack.releases;

        return pack;
    },
};

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
            id: helpers.nextId(res.locals.data.packages),
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
        res.send(
            res.locals.data.packages.find(
                (p) => p.id === parseInt(req.params.id)
            )
        );
    })
    .put("/:id", async (req, res) => {
        res.locals.data.packages = res.locals.data.packages.map((p) => {
            if (p.id !== parseInt(req.params.id)) return p;
            return !req.body.releases
                ? helpers.newRelease(p)
                : helpers.update(p, req.body);
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
