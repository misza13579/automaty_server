const express = require("express");
const db = require("../db/database");
const verifyToken = require("../middleware/verifyToken.js");

const router = express.Router();

router.post("/zapisz_wynik", (req, res) => {
    const { id, wynik } = req.body;
    function formatujDate(date) {
        const pad = n => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ` +
       `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

const teraz = formatujDate(new Date());
    console.log(id, wynik, "zapisuje wynik");

    db.get("SELECT login FROM uzytkownicy WHERE identyfikator = ?", [id], function(err, row) {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(404).send("Użytkownik nie znaleziony");

        const login = row.login;

        db.run("INSERT INTO wyniki (login, data, wynik) VALUES (?, ?, ?)", [login, teraz, wynik], function(err) {
            if (err) return res.status(500).send(err.message);
            res.json({ komunikat: "Wynik zapisany pomyślnie!" });
        });
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

router.get("/najlepsze_wyniki", (req, res) => {
    const sql = `
        SELECT login, MAX(wynik) AS najlepszy_wynik
        FROM wyniki
        GROUP BY login
        ORDER BY najlepszy_wynik DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Błąd SQL:", err);
            return res.status(500).send({ error: err.message });
        }

        res.json(rows);
    });
});




module.exports = router;
