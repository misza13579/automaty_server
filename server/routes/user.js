const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Sprawdzenie identyfikatora (czy użytkownik istnieje)
router.post("/sprawdz_id", (req, res) => {
    const { idcard } = req.body;

    db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ?", [idcard], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json({ istnieje: !!row });
    });
});

// Pobranie loginu po identyfikatorze
router.post("/pobierz_login", (req, res) => {
    const { idcard } = req.body;

    db.get("SELECT login FROM uzytkownicy WHERE identyfikator = ?", [idcard], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json({ login: row ? row.login : null });
    });
});

// Zmiana loginu
router.post("/zmien_login", verifyToken,
    body("nowy_login").isLength({ min: 3 }),
    (req, res) => {
        const { nowy_login } = req.body;
        const { id } = req.user;

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        db.get("SELECT 1 FROM uzytkownicy WHERE login = ?", [nowy_login], (err, row) => {
            if (err) return res.status(500).send(err.message);
            if (row) return res.json({ zmieniono: false, komunikat: "Login już istnieje." });

            db.run("UPDATE uzytkownicy SET login = ? WHERE identyfikator = ?", [nowy_login, id], function(err) {
                if (err) return res.status(500).send(err.message);
                res.json({ zmieniono: true });
            });
        });
    }
);

module.exports = router;
