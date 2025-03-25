const sqlite3 = require('sqlite3').verbose();

// Подключение к базе данных (файл создастся автоматически)
const db = new sqlite3.Database('./database/finance.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
    } else {
        console.log('Подключение к SQLite успешно');
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



module.exports = db;
