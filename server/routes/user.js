const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../db/database");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/sprawdz_id", (req, res) => {
  const { idcard } = req.body;
  db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ?", [idcard], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Błąd serwera" });
    }
    res.json({ istnieje: !!row });
  });
});

router.post("/gracz_info", (req, res) => {
  const { id } = req.body;
  db.get("SELECT login FROM uzytkownicy WHERE identyfikator = ?", [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Błąd serwera" });
    }
    if (!row) return res.status(404).send("Użytkownik nie znaleziony");
    const login = row.login;
    db.get("SELECT wynik FROM wyniki WHERE login = ? ORDER BY wynik DESC LIMIT 1", [login], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Błąd serwera" });
    }
      if (!row) return res.json({ login, najlepszy_wynik: 0 });
      return res.json({ najlepszy_wynik: row.wynik, login });
    });
  });
});

router.put(
  "/zmiana_loginu",
  verifyToken,
  body("newusername").isLength({ min: 3 }),
  (req, res) => {
    const { newusername, password } = req.body;
    const { id, login } = req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    db.get("SELECT 1 FROM uzytkownicy WHERE login = ?", [newusername], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Błąd serwera" });
        }
        if (row) return res.json({ zmieniono: false, komunikat: "Login już istnieje." });

      db.get("SELECT * FROM uzytkownicy WHERE login = ?", [login], (err, userRow) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Błąd serwera" });
        }
        if (!userRow) return res.status(401).json({ zalogowany: false });

        bcrypt.compare(password, userRow.haslo, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Błąd serwera" });
            }
            if (!result) return res.status(401).json({ zmieniono: false, komunikat: "Błędne hasło." });

            db.run("UPDATE uzytkownicy SET login = ?, approved=0 WHERE login = ?", [newusername, login], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Błąd serwera" });
                }

            db.run("UPDATE wyniki SET login = ? WHERE login = ?", [newusername, login], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Błąd serwera" });
                }

              db.run("UPDATE zwyciescy SET login = ? WHERE login = ?", [newusername, login], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Błąd serwera" });
                }

                res.json({ zmieniono: true, komunikat: "login zmieniony poprawnie." });
              });
            });
          });
        });
      });
    });
  }
);

router.put(
  "/zmiana_hasla",
  verifyToken,
  body("newpassword").isLength({ min: 8 }),
  (req, res) => {
    const { newpassword, password } = req.body;
    const { login } = req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    db.get("SELECT * FROM uzytkownicy WHERE login = ?", [login], (err, userRow) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Błąd serwera" });
        }
        if (!userRow) return res.status(401).json({ zalogowany: false });

    bcrypt.compare(password, userRow.haslo, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Błąd serwera" });
        }
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

router.put(
  "/zmiana_hasla2",
  body("newpassword").isLength({ min: 8 }),
  (req, res) => {
    const { newpassword, id } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Błąd serwera" });
        }

      db.run("UPDATE uzytkownicy SET haslo = ? WHERE identyfikator = ?", [hashedPassword, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Błąd serwera" });
        }

        res.json({ zmieniono: true, komunikat: "Hasło zmienione poprawnie." });
      });
    });
  }
);


router.get("/pobranie-uzytkownikow", (req, res) => {
  db.all("SELECT login, identyfikator FROM uzytkownicy WHERE approved = 0", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Błąd bazy danych" });
    users = rows
    res.json(users);
  });
});

router.post("/zmiana-zatwierdzania", (req, res) => {
  const { login } = req.body;
  if (!login) return res.status(400).json({ error: "Brak loginu" });

  db.run("UPDATE uzytkownicy SET approved = 1 WHERE login = ?", [login], function (err) {
    if (err) return res.status(500).json({ error: "Błąd zatwierdzania" });
    res.json({ success: true });
  });
});

router.post("/usun-uzytkownika", (req, res) => {
  const { login } = req.body;

  if (!login) {
    return res.status(400).json({ success: false, error: "Brak loginu" });
  }

  db.run("DELETE FROM uzytkownicy WHERE login = ?", [login], function (err) {
    if (err) {
      console.error("Błąd usuwania użytkownika:", err.message);
      return res.status(500).json({ success: false, error: "Błąd bazy danych" });
    }
      db.run("DELETE FROM wyniki WHERE login = ?", [login], function (err) {
    if (err) {
      console.error("Błąd usuwania użytkownika:", err.message);
      return res.status(500).json({ success: false, error: "Błąd bazy danych" });
    }

    res.json({ success: true });
  });
})});

module.exports = router;