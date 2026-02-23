const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const filePath = path.join(__dirname, "entries.txt");
const filePath2 = path.join(__dirname, "users.txt");

const cors = require("cors");
app.use(cors());

// Neuen Eintrag speichern
app.post("/save", (req, res) => {
  const { text, titel, votes, votedBy } = req.body;

  if (!text || !titel) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    let entries = [];

    if (!err && data) {
      entries = JSON.parse(data);
    }

    entries.push({ titel, text, votes, votedBy });

    fs.writeFile(filePath, JSON.stringify(entries, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Speichern fehlgeschlagen" });

      res.json({ success: true });
    });
  });
});



// Alle Einträge laden
app.get("/entries", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err || !data) {
      return res.json([]);
    }

    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      res.json([]);
    }
  });
});

app.post("/voteGood", (req, res) => {
  const { titel, user } = req.body;
  if (!titel || !user) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err || !data) return res.status(500).json({ error: "Dateifehler" });
    let entries;
    try {
      entries = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: "JSON kaputt" });
    }
    const entry = entries.find(e => e.titel === titel);
    if (!entry) {
      return res.status(404).json({ error: "Eintrag nicht gefunden" });
    }
    // Falls noch nicht existiert
    if (!entry.votesGood) entry.votesGood = 0;
    if (!entry.votedBy) entry.votedBy = [];
    // Doppel-Vote verhindern
    if (entry.votedBy.includes(user)) {
      return res.status(403).json({ error: "Schon gevotet" });
    }
    entry.votesGood++;
    entry.votedBy.push(user);
    fs.writeFile(filePath, JSON.stringify(entries, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Speichern fehlgeschlagen" });
      res.json({ success: true });
    });
  });
});

app.post("/voteBad", (req, res) => {
  const { titel, user } = req.body;
  if (!titel || !user) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err || !data) return res.status(500).json({ error: "Dateifehler" });
    let entries;
    try {
      entries = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: "JSON kaputt" });
    }
    const entry = entries.find(e => e.titel === titel);
    if (!entry) {
      return res.status(404).json({ error: "Eintrag nicht gefunden" });
    }
    // Falls noch nicht existiert
    if (!entry.votesBad) entry.votesBad = 0;
    if (!entry.votedBy) entry.votedBy = [];
    // Doppel-Vote verhindern
    if (entry.votedBy.includes(user)) {
      return res.status(403).json({ error: "Schon gevotet" });
    }
    entry.votesBad++;
    entry.votedBy.push(user);
    fs.writeFile(filePath, JSON.stringify(entries, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Speichern fehlgeschlagen" });
      res.json({ success: true });
    });
  });
});


app.get("/login", (req, res) => {
  fs.readFile(filePath2, "utf8", (err, data) => {
    if (err || !data) {
      return res.json([]);
    }

    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      res.json([]);
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});