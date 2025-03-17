const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

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

// Создание таблицы, если она еще не существует
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    date TEXT
  );
`);

// API для добавления транзакции
app.post("/transaction", (req, res) => {
  const { description, amount, date } = req.body;

  if (!description || !amount || !date) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  const query = `INSERT INTO transactions (description, amount, date) VALUES (?, ?, ?)`;

  db.run(query, [description, amount, date], function (err) {
    if (err) {
      return res.status(500).json({ message: "Ошибка при добавлении транзакции", error: err });
    }
    res.status(201).json({
      message: "Транзакция успешно добавлена",
      transaction: { id: this.lastID, description, amount, date },
    });
  });
});

// Главная страница
app.get("/", (req, res) => {
  res.send("Finance Tracker API работает!");
});

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
