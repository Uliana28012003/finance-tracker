const sqlite3 = require('sqlite3').verbose();

// Подключение к базе данных (файл создастся автоматически)
const db = new sqlite3.Database('./database/finance.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
    } else {
        console.log('Подключение к SQLite успешно');
    }
});

// Создание таблицы транзакций, если её нет
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
            date TEXT NOT NULL
        )
    `);
});

module.exports = db;
