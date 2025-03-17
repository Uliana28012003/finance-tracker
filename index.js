const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Finance Tracker API работает!');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
