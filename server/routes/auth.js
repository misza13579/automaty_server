const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db/database");
require("dotenv").config();

const router = express.Router();

// Rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
});

// 🔐 Logowanie
router.post(
    "/logowanie",
    body("username").isLength({ min: 3 }),
    body("password").isLength({ min: 6 }),
    loginLimiter,
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: "Błąd po stronie serwera" });

        const { username, password } = req.body;

        db.get("SELECT * FROM uzytkownicy WHERE login = ?", [username], (err, row) => {
            if (err) {
                console.error("Błąd DB (logowanie):", err);
                return res.status(500).json({ error: "Błąd po stronie serwera" });
            }

            if (!row) return res.status(401).json({ zalogowany: false });

            bcrypt.compare(password, row.haslo, (err, result) => {
                if (err || !result) return res.status(401).json({ zalogowany: false });

                const token = jwt.sign(
                    { id: row.identyfikator, login: row.login },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );
                res.json({ zalogowany: true, token: token });
            });
        });
    }
);

// 🧾 Rejestracja
router.post("/dodaj_uzytkownika", (req, res) => {
    const { idcard, username, password } = req.body;

    if (!idcard || !username || !password) {
        return res.status(400).json({ sukces: false, message: "Błąd po stronie serwera" });
    }

    db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ? OR login = ?", [idcard, username], (err, row) => {
        if (err) {
            console.error("Błąd DB (sprawdzenie istniejącego użytkownika):", err);
            return res.status(500).json({ sukces: false, message: "Błąd po stronie serwera" });
        }

        if (row) return res.json({ sukces: false, message: "Rejestracja nie powiodła się" });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Błąd haszowania:", err);
                return res.status(500).json({ sukces: false, message: "Błąd po stronie serwera" });
            }

            db.run(
                "INSERT INTO uzytkownicy (identyfikator, login, haslo) VALUES (?, ?, ?)",
                [idcard, username, hashedPassword],
                function (err) {
                    if (err) {
                        console.error("Błąd DB (rejestracja):", err);
                        return res.status(500).json({ sukces: false, message: "Błąd po stronie serwera" });
                    }

                    res.json({ sukces: true, message: "Rejestracja zakończona sukcesem" });
                }
            );
        });
    });
});

module.exports = router;
