const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к базе данных SQLite
const db = new sqlite3.Database("./database/finance.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.message);
  } else {
    console.log("Подключение к SQLite успешно");
  }
});

// Создание таблицы транзакций, если она еще не существует
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    amount REAL,
    type TEXT CHECK(type IN ('income', 'expense')),
    date TEXT
  );
`);

// Создание таблицы пользователей, если она еще не существует
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

// Регистрация пользователя
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Ошибка регистрации" });
      }
      res.status(201).json({ message: "Регистрация успешна!" });
    }
  );
});

// API для добавления транзакции
app.post("/transaction", (req, res) => {
  const { category, amount, type, date } = req.body;

  if (!category || !amount || !type || !date) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  const query = `INSERT INTO transactions (category, amount, type, date) VALUES (?, ?, ?, ?)`;

  db.run(query, [category, amount, type, date], function (err) {
    if (err) {
      return res.status(500).json({ message: "Ошибка при добавлении транзакции", error: err });
    }
    res.status(201).json({
      message: "Транзакция успешно добавлена",
      transaction: { id: this.lastID, category, amount, type, date },
    });
  });
});

// API для получения всех транзакций
app.get("/transactions", (req, res) => {
  const query = "SELECT * FROM transactions";

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при получении транзакций", error: err });
    }
    res.status(200).json({ transactions: rows });
  });
});

// API для удаления транзакции
app.delete("/transaction/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM transactions WHERE id = ?";

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Ошибка при удалении транзакции", error: err });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    res.status(200).json({ message: `Транзакция с id ${id} удалена` });
  });
});

// API для обновления транзакции
app.put("/transaction/:id", (req, res) => {
  const { id } = req.params;
  const { category, amount, type, date } = req.body;

  if (!category || !amount || !type || !date) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  const query = "UPDATE transactions SET category = ?, amount = ?, type = ?, date = ? WHERE id = ?";

  db.run(query, [category, amount, type, date, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Ошибка при обновлении транзакции", error: err });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }

    res.status(200).json({
      message: `Транзакция с id ${id} обновлена`,
      transaction: { id, category, amount, type, date },
    });
  });
});

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
