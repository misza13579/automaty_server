const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/verifyToken");
const e = require("express");

const router = express.Router();

// Sprawdzenie identyfikatora (czy użytkownik istnieje)
router.post("/sprawdz_id", (req, res) => {
    const { idcard } = req.body;

    db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ?", [idcard], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json({ istnieje: !!row });
    });
});

router.post('/gracz_info', (req, res) => {
    const { id } = req.body;

    // Pierwsze zapytanie: pobierz login
    db.get("SELECT login FROM uzytkownicy WHERE identyfikator = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);  // W przypadku błędu zwróć 500
        }

        if (!row) {
            return res.status(404).send("Użytkownik nie znaleziony");  // Jeśli nie znaleziono, zwróć 404
        }

        const login = row.login;

        // Drugie zapytanie: pobierz najlepszy wynik
        db.get("SELECT wynik FROM wyniki WHERE login = ? ORDER BY wynik DESC LIMIT 1", [login], (err, row) => {
            if (err) {
                console.log("Błąd przy zapytaniu o wynik:", err);
                return res.json({ najlepszy_wynik: 0 });  // W przypadku błędu, zwróć wynik 0
            }

            if (!row) {
                return res.json({ najlepszy_wynik: 0 });  // Jeśli nie ma wyniku, zwróć 0
            }

            console.log("Najlepszy wynik:", row.wynik);
            return res.json({ najlepszy_wynik: row.wynik, login: login });  // Zwróć dane gracza
        });
    });
});



// Zmiana loginu
router.put("/zmiana_loginu", verifyToken,
    body("newusername").isLength({ min: 3, max: 20 }).withMessage("Login musi mieć od 3 do 20 znaków"),
    body("password").notEmpty().withMessage("Hasło jest wymagane"),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { newusername, password } = req.body;
        const { id, login } = req.user;

        db.get("SELECT 1 FROM uzytkownicy WHERE login = ?", [newusername], (err, row) => {
            if (err) return res.status(500).json({ komunikat: "Błąd serwera" });
            if (row) return res.status(400).json({ komunikat: "Login już istnieje" });

            db.get("SELECT * FROM uzytkownicy WHERE login = ?", [login], (err, userRow) => {
                if (err) return res.status(500).json({ komunikat: "Błąd serwera" });
                if (!userRow) return res.status(401).json({ komunikat: "Nieautoryzowany dostęp" });

                bcrypt.compare(password, userRow.haslo, (err, result) => {
                    if (err) return res.status(500).json({ komunikat: "Błąd serwera" });
                    if (!result) return res.status(401).json({ komunikat: "Błędne hasło" });

                    // Wszystko OK – aktualizujemy login we wszystkich tabelach
                    db.run("UPDATE uzytkownicy SET login = ? WHERE login = ?", [newusername, login], (err) => {
                        if (err) return res.status(500).json({ komunikat: "Błąd serwera" });

                        db.run("UPDATE wyniki SET login = ? WHERE login = ?", [newusername, login], (err) => {
                            if (err) return res.status(500).json({ komunikat: "Błąd serwera" });

                            db.run("UPDATE zwyciescy SET login = ? WHERE login = ?", [newusername, login], (err) => {
                                if (err) return res.status(500).json({ komunikat: "Błąd serwera" });

                                res.json({ komunikat: "Login zmieniony poprawnie" });
                            });
                        });
                    });
                });
            });
        });
    }
);
router.put("/zmiana_hasla", verifyToken,
    body("newpassword").isLength({ min: 8, max: 20 }),
    (req, res) => {
        const { newpassword, password } = req.body;
        const { login } = req.user;

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        db.get("SELECT * FROM uzytkownicy WHERE login = ?", [login], (err, userRow) => {
            if (err) return res.status(500).send(err.message);
            if (!userRow) return res.status(401).json({ zalogowany: false });

            bcrypt.compare(password, userRow.haslo, (err, result) => {
                if (err) return res.status(500).send(err.message);
                if (!result) return res.status(401).json({ zmieniono: false, komunikat: "Błędne hasło." });

                bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
                    if (err) return res.status(500).send("Błąd haszowania hasła");

                    db.run("UPDATE uzytkownicy SET haslo = ? WHERE login = ?", [hashedPassword, login], (err) => {
                        if (err) return res.status(500).send(err.message);

                        res.json({ zmieniono: true, komunikat: "Hasło zmienione poprawnie." });
                    });
                });
            });
        });
    }
);

router.put("/zmiana_hasla2", body("newpassword").isLength({ min: 8, max: 20 }),
    (req, res) => {
        const { newpassword, id} = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
            if (err) return res.status(500).send("Błąd haszowania hasła");

            db.run("UPDATE uzytkownicy SET haslo = ? WHERE identyfikator = ?", [hashedPassword, id], (err) => {
                if (err) return res.status(500).send(err.message);

                res.json({ zmieniono: true, komunikat: "Hasło zmienione poprawnie." });
            });
        });
    }
);

module.exports = router;
