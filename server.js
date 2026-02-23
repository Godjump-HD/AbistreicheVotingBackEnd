const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const filePath = path.join(__dirname, "entries.json");
const filePath2 = path.join(__dirname, "users.json");


// =====================
// SAVE ENTRY
// =====================
app.post("/save", (req, res) => {
  const { text, titel } = req.body;

  if (!text || !titel) {
    return res.status(400).json({ error: "Fehlende Daten" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    let entries = [];

    if (!err && data) {
      try {
        entries = JSON.parse(data);
      } catch {
        entries = [];
      }
    }

    entries.push({
      titel,
      text,
      votesGood: 0,
      votesBad: 0,
      votedBy: []
    });

    fs.writeFile(filePath, JSON.stringify(entries, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Speichern fehlgeschlagen" });

      res.json({ success: true });
    });
  });
});


// =====================
// LOAD ENTRIES
// =====================
app.get("/entries", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err || !data) return res.json([]);

    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});


// =====================
// VOTE
// =====================
app.post("/vote", (req, res) => {
  const { titel, user, type } = req.body;

  if (!titel || !user || !type) {
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

    if (entry.votedBy.includes(user)) {
      return res.status(403).json({ error: "Schon gevotet" });
    }

    if (type === "good") entry.votesGood++;
    if (type === "bad") entry.votesBad++;

    entry.votedBy.push(user);

    fs.writeFile(filePath, JSON.stringify(entries, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Speichern fehlgeschlagen" });

      res.json({ success: true });
    });
  });
});


app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
