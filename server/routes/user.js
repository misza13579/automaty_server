const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const bcrypt = require("bcrypt");
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
router.put("/zmiana_loginu", verifyToken,
    body("newusername").isLength({ min: 3 }),
    (req, res) => {
        const { newusername, password } = req.body;
        const { id, login } = req.user;

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        db.get("SELECT 1 FROM uzytkownicy WHERE login = ?", [newusername], (err, row) => {
            if (err) return res.status(500).send(err.message);
            if (row) return res.json({ zmieniono: false, komunikat: "Login już istnieje." });

            db.get("SELECT * FROM uzytkownicy WHERE login = ?", [login], (err, userRow) => {
                if (err) return res.status(500).send(err.message);
                if (!userRow) return res.status(401).json({ zalogowany: false });

                bcrypt.compare(password, userRow.haslo, (err, result) => {
                    if (err) return res.status(500).send(err.message);
                    if (!result) return res.status(401).json({ zmieniono: false, komunikat: "Błędne hasło." });

                    // Wszystko OK – aktualizujemy login we wszystkich tabelach
                    db.run("UPDATE uzytkownicy SET login = ? WHERE login = ?", [newusername, login], (err) => {
                        if (err) return res.status(500).send(err.message);

                        db.run("UPDATE wyniki SET login = ? WHERE login = ?", [newusername, login], (err) => {
                            if (err) return res.status(500).send(err.message);

                            db.run("UPDATE zwyciescy SET login = ? WHERE login = ?", [newusername, login], (err) => {
                                if (err) return res.status(500).send(err.message);

                                res.json({ zmieniono: true });
                            });
                        });
                    });
                });
            });
        });
    }
);


module.exports = router;
