const express = require("express");
const db = require("../db/database");
const verifyToken = require("../middleware/verifyToken.js");

const router = express.Router();

// Zapisanie wyniku
router.post("/zapisz_wynik", verifyToken, (req, res) => {
    const { id } = req.user;
    const { wynik } = req.body;

    db.run("INSERT INTO wyniki (identyfikator, wynik) VALUES (?, ?)", [id, wynik], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ zapisano: true });
    });
});

// Pobranie najlepszego wyniku
router.post("/najlepszy_wynik", verifyToken, (req, res) => {
    const { id } = req.user;

    db.get("SELECT MAX(wynik) AS wynik FROM wyniki WHERE identyfikator = ?", [id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json({ wynik: row ? row.wynik : 0 });
    });
});

router.get("/wyniki", verifyToken, (req, res) => {
    const { login } = req.user;
    console.log(login);

    db.all("SELECT * FROM wyniki WHERE login = ?", [login], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json(row);
    });
});

module.exports = router;
