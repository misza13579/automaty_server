const express = require("express");
const db = require("../db/database");
const verifyToken = require("../middleware/verifyToken.js");

const router = express.Router();

router.post("/zapisz_wynik", (req, res) => {
  const { id, wynik } = req.body;

  function formatujDate(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const teraz = formatujDate(new Date());

  db.get("SELECT login FROM uzytkownicy WHERE identyfikator = ?", [id], (err, row) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: "Błąd serwera" });
    }
    if (!row) return res.status(404).send("Użytkownik nie znaleziony");

    const login = row.login;

    db.run("INSERT INTO wyniki (login, data, wynik) VALUES (?, ?, ?)", [login, teraz, wynik], err => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: "Błąd serwera" });
    }
      res.json({ komunikat: "Wynik zapisany pomyślnie!" });
    });
  });
});

router.post("/najlepszy_wynik", verifyToken, (req, res) => {
  const { id } = req.user;

  db.get("SELECT MAX(wynik) AS wynik FROM wyniki WHERE identyfikator = ?", [id], (err, row) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: "Błąd serwera" });
    }
    res.json({ wynik: row ? row.wynik : 0 });
  });
});

router.get("/wyniki", verifyToken, (req, res) => {
  const { login } = req.user;

  db.all("SELECT * FROM wyniki WHERE login = ?", [login], (err, rows) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: "Błąd serwera" });
    }
    res.json(rows.reverse());
  });
});
router.get("/najlepsze_wyniki", (req, res) => {
  db.all(`SELECT login FROM uzytkownicy WHERE approved = 1`, [], (err, approvedUsers) => {
    if (err) {
      console.error("Błąd przy approved:", err.message);
      return res.status(500).json({ error: "Błąd serwera" });
    }

    const loginy = approvedUsers.map(user => user.login);

    if (loginy.length > 0) {
      const placeholders = loginy.map(() => '?').join(', ');
      const sql = `
        SELECT login, MAX(wynik) AS najlepszy_wynik
        FROM wyniki
        WHERE login IN (${placeholders})
        GROUP BY login
        ORDER BY najlepszy_wynik DESC
      `;

      db.all(sql, loginy, (err, results) => {
        if (err) {
          console.error("Błąd przy wynikach:", err.message);
          return res.status(500).json({ error: "Błąd serwera" });
        }

        return res.json(results);
      });

    } else {
      return res.json([]);
    }
  });
});


module.exports = router;