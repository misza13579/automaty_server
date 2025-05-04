const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db/database");

const router = express.Router();

// Rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
});

// Logowanie
router.post("/logowanie", 
    body("username").isLength({ min: 3 }), 
    body("password").isLength({ min: 6 }),
    loginLimiter, 
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, password } = req.body;

        db.get("SELECT * FROM uzytkownicy WHERE login = ?", [username], (err, row) => {
            if (err) return res.status(500).send(err.message);
            if (!row) return res.status(401).json({ zalogowany: false });

            bcrypt.compare(password, row.haslo, (err, result) => {
                if (err || !result) return res.status(401).json({ zalogowany: false });

                const token = jwt.sign(
                    { id: row.identyfikator, login: row.login },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );
                res.json({ zalogowany: true, token });
            });
        });
    }
);

// Rejestracja (dodawanie użytkownika)
router.post("/dodaj_uzytkownika", (req, res) => {
    const { idcard, username, password } = req.body;

    db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ? OR login = ?", [idcard, username], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (row) return res.json({ dodano: false });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).send("Błąd haszowania hasła");

            db.run("INSERT INTO uzytkownicy (identyfikator, login, haslo) VALUES (?, ?, ?)", 
                [idcard, username, hashedPassword], 
                function(err) {
                    if (err) return res.status(500).send(err.message);
                    res.json({ dodano: true });
                });
        });
    });
});

module.exports = router;
