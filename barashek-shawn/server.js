const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    charset: "utf8mb4", 
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 30000,
    ssl: false 
});

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Извлечение токена из "Bearer TOKEN"

    if (!token) return res.status(401).json({ error: "Доступ запрещен. Токен отсутствует." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Недействительный или просроченный токен." });
        req.user = user;
        next();
    });
};

// ==========================================
// 1. КАТАЛОГ ТОВАРОВ (ДЛЯ КЛИЕНТОВ)
// ==========================================
app.get("/api/products", (req, res) => {
    const sqlQuery = "SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_available = 1";
    
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА MYSQL ПРИ ПОЛУЧЕНИИ ТОВАРОВ:", err);
            return res.status(500).json({ error: "Ошибка БД", details: err.message });
        }
        res.json(results);
    });
});

// ==========================================
// 2. РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ (Таблица users)
// ==========================================

// Регистрация
app.post("/api/auth/register", async (req, res) => {
    const { first_name, phone, email, password } = req.body;
    if (!email || !password || !first_name || !phone) {
        return res.status(400).json({ error: "Заполните обязательные поля: имя, телефон, email и пароль" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlQuery = "INSERT INTO users (first_name, phone, email, password_hash) VALUES (?, ?, ?, ?)";

        db.query(sqlQuery, [first_name, phone, email, hashedPassword], (err, result) => {
            if (err) {
                console.error("ОШИБКА РЕГИСТРАЦИИ:", err);
                if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Этот Email уже зарегистрирован" });
                return res.status(500).json({ error: "Ошибка при регистрации" });
            }
            res.status(201).json({ message: "Пользователь успешно создан!" });
        });
    } catch (e) {
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// Логин
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = "SELECT * FROM users WHERE email = ?";

    db.query(sqlQuery, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        if (results.length === 0) return res.status(400).json({ error: "Пользователь не найден" });

        const user = results[0];
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: "Неверный пароль" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

        res.json({
            token,
            user: { id: user.id, first_name: user.first_name, email: user.email, phone: user.phone }
        });
    });
});

// ==========================================
// 3. ОФОРМЛЕНИЕ ЗАКАЗА (Таблицы orders и order_items)
// ==========================================
app.post("/api/orders", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { items, total_price, delivery_address, comment } = req.body; 

    if (!items || items.length === 0) return res.status(400).json({ error: "Корзина пуста" });

    const orderQuery = "INSERT INTO orders (user_id, status, delivery_address, total_price, comment) VALUES (?, 'создан', ?, ?, ?)";
    
    db.query(orderQuery, [userId, delivery_address, total_price, comment || null], (err, orderResult) => {
        if (err) {
            console.error("ОШИБКА СОЗДАНИЯ ЗАКАЗА:", err);
            return res.status(500).json({ error: "Не удалось создать заказ в базе данных" });
        }
        
        const orderId = orderResult.insertId;

        const orderItemsQuery = "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?";
        const values = items.map(item => [orderId, item.product_id, item.quantity, item.price_at_purchase]);

        db.query(orderItemsQuery, [values], (err) => {
            if (err) {
                console.error("ОШИБКА СОХРАНЕНИЯ ПОЗИЦИЙ ЗАКАЗА:", err);
                return res.status(500).json({ error: "Заказ создан, но не удалось сохранить товары" });
            }
            res.status(201).json({ message: "Заказ успешно оформлен!", orderId });
        });
    });
});

// ==========================================
// 4. CRUD ДЛЯ АДМИН-ПАНЕЛИ (ДОБАВЛЕННЫЙ БЛОК)
// ==========================================

// --- КАТЕГОРИИ ---

// Получить все категории
app.get("/api/admin/categories", (req, res) => {
    const sqlQuery = "SELECT * FROM categories ORDER BY name ASC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ CATEGORIES:", err);
            return res.status(500).json({ error: "Ошибка при получении категорий", details: err.message });
        }
        res.json(results);
    });
});

// Создать категорию
app.post("/api/admin/categories", (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "Заполните поля name и slug" });

    const sqlQuery = "INSERT INTO categories (name, slug) VALUES (?, ?)";
    db.query(sqlQuery, [name, slug], (err, result) => {
        if (err) {
            console.error("ОШИБКА CREATE CATEGORY:", err);
            return res.status(500).json({ error: "Не удалось создать категорию" });
        }
        res.status(201).json({ message: "Категория создана успешно", id: result.insertId });
    });
});

// [UPDATE] Изменить существующую категорию по ID
app.put("/api/admin/categories/:id", (req, res) => {
    const categoryId = req.params.id;
    const { name, slug } = req.body;

    if (!name || !slug) {
        return res.status(400).json({ error: "Поля name и slug обязательны для заполнения" });
    }

    const sqlQuery = "UPDATE categories SET name = ?, slug = ? WHERE id = ?";
    db.query(sqlQuery, [String(name), String(slug), categoryId], (err, result) => {
        if (err) {
            console.error("ОШИБКА UPDATE CATEGORY:", err);
            return res.status(500).json({ error: "Ошибка БД при обновлении категории", details: err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Категория с таким ID не найдена" });
        }

        res.json({ message: "Категория успешно обновлена" });
    });
});

// [DELETE] Удалить категорию по ID
app.delete("/api/admin/categories/:id", (req, res) => {
    const categoryId = req.params.id;

    const sqlQuery = "DELETE FROM categories WHERE id = ?";
    db.query(sqlQuery, [categoryId], (err, result) => {
        if (err) {
            console.error("ОШИБКА DELETE CATEGORY:", err);
            // Защита: если в категории есть товары, MySQL не даст её удалить из-за ограничений ключа
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({ 
                    error: "Нельзя удалить категорию, так как к ней привязаны товары. Сначала удалите товары или перенесите их в другую категорию." 
                });
            }
            return res.status(500).json({ error: "Ошибка при удалении категории" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Категория не найдена" });
        }

        res.json({ message: "Категория успешно удалена" });
    });
});


// ==========================================
// УПРАВЛЕНИЕ ТОВАРОВ (БЕЗОПАСНЫЙ ИСПРАВЛЕННЫЙ БЛОК)
// ==========================================

// 1. Получить все товары для админки
app.get("/api/admin/products", (req, res) => {
    const sqlQuery = "SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ ALL PRODUCTS:", err);
            return res.status(500).json({ error: "Ошибка при получении товаров для админки" });
        }
        res.json(results);
    });
});

// 2. Добавить новый товар (POST)
app.post("/api/admin/products", (req, res) => {
    const { category_id, name, description, weight_g, price, is_available, images_url } = req.body;

    if (!category_id || !name || !price) {
        return res.status(400).json({ error: "Поля category_id, name и price обязательны для заполнения" });
    }

    const finalCategoryId = parseInt(category_id);
    const finalName = String(name);
    const finalDescription = description ? String(description) : "";
    const finalWeight = weight_g && !isNaN(weight_g) ? parseInt(weight_g) : 0;
    const finalPrice = parseFloat(price);
    const finalAvailable = is_available === 1 || is_available === "1" ? 1 : 0;
    const finalImageUrl = images_url ? String(images_url) : "";

    const sqlQuery = "INSERT INTO products (category_id, name, description, weight_g, price, is_available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [finalCategoryId, finalName, finalDescription, finalWeight, finalPrice, finalAvailable, finalImageUrl];

    db.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА MYSQL ПРИ СОЗДАНИИ:", err);
            return res.status(400).json({ error: "MySQL отказался сохранить товар", details: err.message });
        }
        res.status(201).json({ message: "Товар успешно добавлен", id: result.insertId });
    });
});

// 3. Редактировать товар (PUT)
app.put("/api/admin/products/:id", (req, res) => {
    const productId = req.params.id;
    const { category_id, name, description, weight_g, price, is_available, images_url } = req.body;

    if (!category_id || !name || !price) {
        return res.status(400).json({ error: "Поля category_id, name и price обязательны" });
    }

    const finalCategoryId = parseInt(category_id);
    const finalName = String(name);
    const finalDescription = description ? String(description) : "";
    const finalWeight = weight_g && !isNaN(weight_g) ? parseInt(weight_g) : 0;
    const finalPrice = parseFloat(price);
    const finalAvailable = is_available === 1 || is_available === "1" ? 1 : 0;
    const finalImageUrl = images_url ? String(images_url) : "";

    const sqlQuery = "UPDATE products SET category_id = ?, name = ?, description = ?, weight_g = ?, price = ?, is_available = ?, image_url = ? WHERE id = ?";
    const values = [finalCategoryId, finalName, finalDescription, finalWeight, finalPrice, finalAvailable, finalImageUrl, productId];

    db.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА MYSQL ПРИ ОБНОВЛЕНИИ:", err);
            return res.status(400).json({ error: "MySQL отказался обновить товар", details: err.message });
        }
        res.json({ message: "Товар успешно обновлен" });
    });
});

// 4. Удалить товар (DELETE)
app.delete("/api/admin/products/:id", (req, res) => {
    const productId = req.params.id;
    const sqlQuery = "DELETE FROM products WHERE id = ?";
    db.query(sqlQuery, [productId], (err, result) => {
        if (err) {
            console.error("ОШИБКА DELETE PRODUCT:", err);
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({ error: "Нельзя удалить блюдо, так как оно есть в заказах. Скройте его статус." });
            }
            return res.status(500).json({ error: "Ошибка при удалении товара" });
        }
        res.json({ message: "Товар успешно удален" });
    });
});

// ==========================================
// УПРАВЛЕНИЕ БРОНИРОВАНИЕМ (АДМИНКА)
// ==========================================

// 1. Получить все бронирования с информацией о клиенте и столике
app.get("/api/admin/reservations", (req, res) => {
    const sqlQuery = `
        SELECT r.*, u.first_name, u.phone, u.email, t.table_number, t.capacity 
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN tables t ON r.table_id = t.id
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `;
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ RESERVATIONS:", err);
            return res.status(500).json({ error: "Ошибка при получении списка бронирований" });
        }
        res.json(results);
    });
});

// 2. Получить список всех столов ресторана (для назначения в форме брони)
app.get("/api/admin/tables", (req, res) => {
    const sqlQuery = "SELECT * FROM tables ORDER BY table_number ASC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ TABLES:", err);
            return res.status(500).json({ error: "Ошибка при получении списка столов" });
        }
        res.json(results);
    });
});

// 3. Обновить статус брони или назначить столик (PUT)
app.put("/api/admin/reservations/:id", (req, res) => {
    const reservationId = req.params.id;
    const { status, table_id } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Статус бронирования обязателен" });
    }

    const sqlQuery = "UPDATE reservations SET status = ?, table_id = ? WHERE id = ?";
    const values = [String(status), table_id && !isNaN(table_id) ? parseInt(table_id) : null, reservationId];

    db.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error("ОШИБКА UPDATE RESERVATION:", err);
            return res.status(400).json({ error: "MySQL отказался обновить бронирование", details: err.message });
        }
        res.json({ message: "Бронирование успешно обновлено" });
    });
});

app.delete("/api/admin/reservations/:id", (req, res) => {
    db.query("DELETE FROM reservations WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Ошибка удаления брони" });
        res.json({ message: "Бронирование удалено" });
    });
});

// ==========================================
// УПРАВЛЕНИЕ ОТЗЫВАМИ (АДМИНКА)
// ==========================================

// 1. Получить все отзывы с привязкой к автору и товару
app.get("/api/admin/reviews", (req, res) => {
    const sqlQuery = `
        SELECT r.*, u.first_name, u.email, p.name AS product_name 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
    `;
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ REVIEWS:", err);
            return res.status(500).json({ error: "Ошибка при получении списка отзывов" });
        }
        res.json(results);
    });
});

// 2. Удалить отзыв по ID (модерация)
app.delete("/api/admin/reviews/:id", (req, res) => {
    const reviewId = req.params.id;
    const sqlQuery = "DELETE FROM reviews WHERE id = ?";

    db.query(sqlQuery, [reviewId], (err, result) => {
        if (err) {
            console.error("ОШИБКА DELETE REVIEW:", err);
            return res.status(500).json({ error: "Не удалось удалить отзыв из базы данных" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Отзыв с таким ID не найден" });
        }
        res.json({ message: "Отзыв успешно удален" });
    });
});


const PORT = process.env.SERVER_PORT || 5000; 
app.listen(PORT, () => console.log(`Бэкенд запущен на порту ${PORT}`));
