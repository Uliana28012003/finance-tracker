const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
require("dotenv").config(); // Подключаем переменные окружения

const app = express();

// Настройка CORS, чтобы разрешить запросы с любых доменов
app.use(cors({ origin: "*" }));

app.use(express.json()); // Для обработки JSON-запросов

const SECRET_KEY = process.env.SECRET_KEY || "supersecret"; // Берем из .env или дефолтный

if (!process.env.SECRET_KEY) {
  console.warn("⚠️ Внимание! SECRET_KEY не задан в .env файле. Используется небезопасный ключ.");
}

// Подключение к БД
const db = new sqlite3.Database("./database/finance.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к БД:", err.message);
  } else {
    console.log("✅ Подключение к SQLite успешно");
  }
});

// Создание таблицы пользователей (если её нет)
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Создание таблицы транзакций (если её нет)
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

// 🔐 Регистрация пользователя
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Ошибка регистрации", error: err.message });
        }
        res.status(201).json({ message: "Регистрация успешна!" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// 🔑 Авторизация (логин)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error("Ошибка при поиске пользователя в базе данных:", err.message);
      return res.status(500).json({ message: "Ошибка сервера", error: err.message });
    }

    if (!user) {
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    bcrypt.compare(password, user.password, (err, isValidPassword) => {
      if (err || !isValidPassword) {
        return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

      // Возвращаем имя пользователя и токен
      res.status(200).json({ 
        message: "Вход выполнен успешно!", 
        token,
        username: user.username  // Возвращаем имя пользователя
      });
    });
  });
});


// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Требуется авторизация" });
  }

  const token = authHeader.split(" ")[1]; // Извлекаем токен без "Bearer"

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Недействительный токен" });
    }
    req.user = user;
    next();
  });
};

// 🔄 Получение всех транзакций пользователя (защищенный маршрут)
app.get("/transactions", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { category } = req.query; // Получаем категорию из параметров запроса

  let query = "SELECT * FROM transactions WHERE userId = ?";
  let params = [userId];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Ошибка при получении транзакций:", err.message);
      return res.status(500).json({ message: "Ошибка при получении транзакций", error: err.message });
    }
    res.status(200).json({ transactions: rows });
  });
});


app.post("/transactions", authenticateToken, (req, res) => {
  console.log("Полученные данные:", req.body);  // Логируем полученные данные

  const { amount, category, type, description, date } = req.body;
  const userId = req.user.userId;

  if (!amount || !category || !type || !date) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  db.run(
    "INSERT INTO transactions (userId, amount, category, type, description, date) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, amount, category, type, description, date],
    function (err) {
      if (err) {
        console.error("Ошибка при добавлении транзакции:", err.message);
        return res.status(500).json({ message: "Ошибка при добавлении транзакции", error: err.message });
      }
      res.status(201).json({ message: "Транзакция добавлена успешно!" });
    }
  );
});




// 🗑️ Удаление транзакции (защищенный маршрут)
app.delete("/transactions/:id", authenticateToken, (req, res) => {
  const transactionId = req.params.id;
  const userId = req.user.userId;

  db.run("DELETE FROM transactions WHERE id = ? AND userId = ?", [transactionId, userId], function (err) {
    if (err) {
      console.error("Ошибка при удалении транзакции:", err.message);
      return res.status(500).json({ message: "Ошибка при удалении транзакции", error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Транзакция не найдена или не принадлежит пользователю" });
    }

    res.status(200).json({ message: "Транзакция удалена успешно!" });
  });
});

// 🚀 Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 Сервер запущен на http://localhost:${PORT}`);
});
