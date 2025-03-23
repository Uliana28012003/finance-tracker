const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
require("dotenv").config(); // Подключаем переменные окружения

const app = express();
app.use(express.json());
app.use(cors()); // Разрешаем запросы с других доменов

const SECRET_KEY = process.env.SECRET_KEY || "supersecret"; // Берем из .env или дефолтный

// Подключение к БД
const db = new sqlite3.Database("./database/finance.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к БД:", err.message);
  } else {
    console.log("Подключение к SQLite успешно");
  }
});

// Создание таблицы пользователей (если ее нет)
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
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

  // Логирование данных, приходящих в запросе
  console.log("Запрос на авторизацию:", req.body);

  if (!username || !password) {
    console.log("Ошибка: отсутствуют обязательные поля (username или password)");
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  // Логирование запроса к базе данных
  console.log(`Поиск пользователя с именем: ${username}`);

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error("Ошибка при поиске пользователя в базе данных:", err.message);
      return res.status(500).json({ message: "Ошибка сервера", error: err.message });
    }

    if (!user) {
      console.log("Пользователь не найден");
      return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
    }

    // Логирование перед сравнением пароля
    console.log("Пользователь найден, проверка пароля");

    bcrypt.compare(password, user.password, (err, isValidPassword) => {
      if (err) {
        console.error("Ошибка при сравнении пароля:", err.message);
        return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
      }

      if (!isValidPassword) {
        console.log("Неверный пароль");
        return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
      }

      // Логирование успешной авторизации и генерации токена
      console.log(`Пользователь ${username} авторизован, генерируем токен`);

      const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

      res.status(200).json({ message: "Вход выполнен успешно!", token });
    });
  });
});


// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

// Пример защищенного маршрута
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Вы получили доступ к защищенному маршруту!", user: req.user });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
