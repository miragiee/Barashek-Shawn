const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Обновленная конфигурация подключения без SSL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    charset: 'utf8mb4', 
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 30000,
    ssl: false // Полностью отключаем SSL, так как Beget его не поддерживает
});


// Эндпоинт для проверки подключения и получения меню
app.get('/api/products', (req, res) => {
    const sqlQuery = "SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_available = 1";
    
    db.query(sqlQuery, (err, results) => {
        if (err) {
            // ВЫВОДИМ ТОЧНУЮ ОШИБКУ В ТЕРМИНАЛ И ОТПРАВЛЯЕМ НА ФРОНТЕНД
            console.error("ПОДРОБНАЯ ОШИБКА MYSQL:", err);
            return res.status(500).json({ 
                error: "Ошибка при получении данных с удаленного сервера",
                details: err.message, // техническое описание ошибки
                code: err.code       // код ошибки (например, ER_NO_SUCH_TABLE)
            });
        }
        res.json(results);
    });
});


// Изменили переменную на SERVER_PORT
const PORT = process.env.SERVER_PORT || 5000; 

app.listen(PORT, () => console.log(`Бэкенд подключен к Beget и запущен на порту ${PORT}`));
