const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("Baza.db");

// Sprawdzenie ID
app.get("/sprawdzenie_id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ?", [id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json({ istnieje: !!row });
    });
});

// logowanie
app.post("/logowanie", (req, res) => {
    const login = req.body.username;
    const haslo  = req.body.password;
    console.log(`dziala ${login} ${haslo}`);
    db.get("SELECT haslo FROM uzytkownicy WHERE login = ?", [login], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row || row.haslo != haslo) return res.json({ zalogowany: false })
            else
        return res.json({zalogowany: true});
    });
});

// Zmiana hasła
app.put("/zmiana_hasla", (req, res) => {
    const { username, password, newpassword } = req.body;
    db.run("UPDATE uzytkownicy SET haslo = ? WHERE login = ? AND haslo = ?", [newpassword, username, password], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ zmieniono: this.changes > 0 });
    });
});

app.put("/zmiana_loginu", (req, res) => {
    const { newusername, username, password } = req.body;
    console.log(`Otrzymane dane: ${newusername} ${username} ${password}`);
    
    if (!newusername || !username || !password) {
        return res.status(400).json({ message: "Wymagane są wszystkie pola: newusername, username i password" });
    }

    // Rozpocznij transakcję
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        // 1. Aktualizacja w tabeli uzytkownicy
        db.run("UPDATE uzytkownicy SET login = ? WHERE haslo = ? AND login = ?", 
            [newusername, password, username], 
            function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    console.error("Błąd bazy danych (uzytkownicy):", err);
                    return res.status(500).json({ message: "Błąd serwera podczas aktualizacji loginu" });
                }
                
                if (this.changes === 0) {
                    db.run("ROLLBACK");
                    return res.status(404).json({ message: "Nie znaleziono użytkownika o podanych danych" });
                }
                
                // 2. Aktualizacja w tabeli wyniki
                db.run("UPDATE wyniki SET login = ? WHERE login = ?", 
                    [newusername, username], 
                    function(err) {
                        if (err) {
                            db.run("ROLLBACK");
                            console.error("Błąd bazy danych (wyniki):", err);
                            return res.status(500).json({ message: "Błąd podczas aktualizacji wyników" });
                        }
                        
                        db.run("COMMIT");
                        res.json({ 
                            message: "Login został pomyślnie zmieniony we wszystkich tabelach",
                            updatedRecords: this.changes + " rekordów w tabeli wyniki"
                        });
                    });
            });
    });
});


// Dodawanie użytkownika
app.post("/dodaj_uzytkownika", (req, res) => {
    const id= req.body.idcard;
    const login = req.body.username;
    const haslo = req.body.password;
    console.log(`dziala ${id} ${login} ${haslo}`);
    db.get("SELECT 1 FROM uzytkownicy WHERE identyfikator = ? OR login = ?", [id, login], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (row) return res.json({ dodano: false });

        db.run("INSERT INTO uzytkownicy (identyfikator, login, haslo) VALUES (?, ?, ?)", [id, login, haslo], function(err) {
            if (err) return res.status(500).send(err.message);
            res.json({ dodano: true });
        });
    });
});

// Wyświetlanie wyników użytkownika
app.get("/wyniki/:login", (req, res) => {
    const login = req.params.login;
    db.all("SELECT * FROM wyniki WHERE login = ?", [login], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Zapisz wynik
app.post("/zapisz_wynik", (req, res) => {
    const { login, data, wynik } = req.body;

    db.run("INSERT INTO wyniki (login, data, wynik) VALUES (?, ?, ?)", [login, data, wynik], (err) => {
        if (err) return res.status(500).send(err.message);

        db.all("SELECT login, data, wynik FROM zwyciescy ORDER BY wynik DESC", [], (err, topWyniki) => {
            if (err) return res.status(500).send(err.message);

            if (topWyniki.length < 10 || wynik > topWyniki[topWyniki.length - 1].wynik) {
                db.run("INSERT INTO zwyciescy (login, data, wynik) VALUES (?, ?, ?)", [login, data, wynik], (err) => {
                    if (err) return res.status(500).send(err.message);

                    db.run(`
                        DELETE FROM zwyciescy
                        WHERE rowid NOT IN (
                            SELECT rowid FROM zwyciescy
                            ORDER BY wynik DESC
                            LIMIT 10
                        )
                    `, [], (err) => {
                        if (err) return res.status(500).send(err.message);
                        res.json({ zapisano: true });
                    });
                });
            } else {
                res.json({ zapisano: true });
            }
        });
    });
});

// Zwróć login po ID
app.get("/login_po_id/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT login FROM uzytkownicy WHERE identyfikator = ?", [id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json({ login: row ? row.login : null });
    });
});

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
