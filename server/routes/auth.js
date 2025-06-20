const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../db/database");
require("dotenv").config();

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.",
});

router.post(
  "/logowanie",
  body("username").isLength({ min: 3 }),
  body("password").isLength({ min: 6 }),
  loginLimiter,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Nieprawidłowe dane logowania.", zalogowany: false });
    }

    const { username, password } = req.body;

    db.get("SELECT * FROM uzytkownicy WHERE login = ?", [username], (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Wystąpił błąd serwera. Spróbuj ponownie później.", zalogowany: false });
      }
      if (!row) {
        return res.status(401).json({ error: "Niepoprawny login lub hasło.", zalogowany: false });
      }

      bcrypt.compare(password, row.haslo, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Wystąpił błąd serwera. Spróbuj ponownie później.", zalogowany: false });
        }
        if (!result) {
          return res.status(401).json({ error: "Niepoprawny login lub hasło.", zalogowany: false });
        }

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

router.post("/dodaj_uzytkownika", (req, res) => {
  const { idcard, username, password, acceptRules } = req.body;

  if (!idcard || !username || !password || !acceptRules) {
    return res.status(400).json({ sukces: false, message: "Wszystkie pola oraz akceptacja regulaminu są wymagane." });
  }

  db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ? OR login = ?", [idcard, username], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sukces: false, message: "Wystąpił błąd serwera. Spróbuj ponownie później." });
    }
    if (row) {
      return res.json({ sukces: false, message: "Podany login lub identyfikator jest już zajęty." });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sukces: false, message: "Wystąpił błąd serwera. Spróbuj ponownie później." });
      }

      db.run(
        "INSERT INTO uzytkownicy (identyfikator, login, haslo, approved) VALUES (?, ?, ?, ?)",
        [idcard, username, hashedPassword, 0],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ sukces: false, message: "Wystąpił błąd serwera. Spróbuj ponownie później." });
          }
          res.json({ sukces: true, message: "Rejestracja zakończona sukcesem. Konto oczekuje na akceptację." });
        }
      );
    });
  });
});

module.exports = router;