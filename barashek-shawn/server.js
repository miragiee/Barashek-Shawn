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

// ==========================================
// MIDDLEWARES ДЛЯ ПРОВЕРКИ ПРАВ
// ==========================================

// 1. Общая проверка: авторизован ли пользователь вообще
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

// 2. Строгая проверка: является ли пользователь администратором (role_id === 1)
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role_id !== 1) {
        return res.status(403).json({ error: "Доступ запрещен. Требуются права администратора." });
    }
    next();
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
// 2. РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ
// ==========================================

// Регистрация (по умолчанию регистрируем как обычного пользователя, например, с дефолтным role_id или без, если в БД настроен DEFAULT)
app.post("/api/auth/register", async (req, res) => {
    const { first_name, phone, email, password } = req.body;
    if (!email || !password || !first_name || !phone) {
        return res.status(400).json({ error: "Заполните обязательные поля: имя, телефон, email и пароль" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Если в вашей структуре у role_id нет значения DEFAULT, укажем ID роли обычного пользователя (например, 2 или иное существующее)
        const sqlQuery = "INSERT INTO users (first_name, phone, email, password_hash, role_id) VALUES (?, ?, ?, ?, 2)"; 

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

// Логин (Добавлено извлечение role_id)
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = "SELECT * FROM users WHERE email = ?";

    db.query(sqlQuery, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        if (results.length === 0) return res.status(400).json({ error: "Пользователь не найден" });

        const user = results[0];
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: "Неверный пароль" });

        // Важно: упаковываем role_id внутрь JWT токена для безопасности
        const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, JWT_SECRET, { expiresIn: "24h" });

        res.json({
            token,
            user: { 
                id: user.id, 
                first_name: user.first_name, 
                email: user.email, 
                phone: user.phone,
                role_id: user.role_id // Отправляем role_id на фронтенд для роутинга
            }
        });
    });
});

// ==========================================
// 3. ОФОРМЛЕНИЕ ЗАКАЗА (ДЛЯ КЛИЕНТОВ)
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
        
        const values = items.map(item => [
            orderId, 
            item.product_id || item.id, 
            item.quantity, 
            item.price || item.price_at_purchase
        ]);

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
// 4. CRUD ДЛЯ АДМИН-ПАНЕЛИ (ДВОЙНАЯ ЗАЩИТА: ТОКЕН + РОЛЬ АДМИНА)
// ==========================================

// --- КАТЕГОРИИ ---

app.get("/api/admin/categories", authenticateToken, requireAdmin, (req, res) => {
    const sqlQuery = "SELECT * FROM categories ORDER BY name ASC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ CATEGORIES:", err);
            return res.status(500).json({ error: "Ошибка при получении категорий", details: err.message });
        }
        res.json(results);
    });
});

app.post("/api/admin/categories", authenticateToken, requireAdmin, (req, res) => {
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

app.put("/api/admin/categories/:id", authenticateToken, requireAdmin, (req, res) => {
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

app.delete("/api/admin/categories/:id", authenticateToken, requireAdmin, (req, res) => {
    const categoryId = req.params.id;
    const sqlQuery = "DELETE FROM categories WHERE id = ?";
    
    db.query(sqlQuery, [categoryId], (err, result) => {
        if (err) {
            console.error("ОШИБКА DELETE CATEGORY:", err);
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


// --- ТОВАРЫ ---

app.get("/api/admin/products", authenticateToken, requireAdmin, (req, res) => {
    const sqlQuery = "SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ ALL PRODUCTS:", err);
            return res.status(500).json({ error: "Ошибка при получении товаров для админки" });
        }
        res.json(results);
    });
});

app.post("/api/admin/products", authenticateToken, requireAdmin, (req, res) => {
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

app.put("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
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

app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
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


// --- БРОНИРОВАНИЕ ---

app.get("/api/admin/reservations", authenticateToken, requireAdmin, (req, res) => {
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
            return res.status(500).json({ error: "Ошибка при получении списка бронирования" });
        }
        res.json(results);
    });
});

app.get("/api/admin/tables", authenticateToken, requireAdmin, (req, res) => {
    const sqlQuery = "SELECT * FROM tables ORDER BY table_number ASC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ TABLES:", err);
            return res.status(500).json({ error: "Ошибка при получении списка столов" });
        }
        res.json(results);
    });
});

app.put("/api/admin/reservations/:id", authenticateToken, requireAdmin, (req, res) => {
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

app.delete("/api/admin/reservations/:id", authenticateToken, requireAdmin, (req, res) => {
    db.query("DELETE FROM reservations WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Ошибка удаления брони" });
        res.json({ message: "Бронирование удалено" });
    });
});


// --- ОТЗЫВЫ ---

app.get("/api/admin/reviews", authenticateToken, requireAdmin, (req, res) => {
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

app.delete("/api/admin/reviews/:id", authenticateToken, requireAdmin, (req, res) => {
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


// --- ПОЛЬЗОВАТЕЛИ (Вывод поля role_id при получении и редактировании) ---

app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
    const sqlQuery = "SELECT id, first_name, phone, email, role_id, created_at FROM users ORDER BY id DESC"; 
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА READ ALL USERS:", err);
            return res.status(500).json({ error: "Ошибка при получении списка пользователей" });
        }
        res.json(results);
    });
});

app.post("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    const { first_name, phone, email, password, role_id } = req.body; 

    if (!first_name || !phone || !email || !password) {
        return res.status(400).json({ error: "Все поля обязательны для заполнения" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const finalRoleId = role_id ? parseInt(role_id) : 2; // По умолчанию обычный юзер, если не указано
        const sqlQuery = "INSERT INTO users (first_name, phone, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)"; 

        db.query(sqlQuery, [first_name, phone, email, hashedPassword, finalRoleId], (err, result) => {
            if (err) {
                console.error("ОШИБКА АДМИН-СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Пользователь с таким Email уже существует" });
                }
                return res.status(500).json({ error: "Не удалось создать пользователя в БД" });
            }
            res.status(201).json({ message: "Пользователь успешно создан", id: result.insertId });
        });
    } catch (e) {
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    const userId = req.params.id;
    const { first_name, phone, email, password, role_id } = req.body; 

    if (!first_name || !phone || !email) {
        return res.status(400).json({ error: "Поля имя, телефон и email обязательны" });
    }

    try {
        let sqlQuery;
        let values;
        const finalRoleId = role_id ? parseInt(role_id) : 2;

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            sqlQuery = "UPDATE users SET first_name = ?, phone = ?, email = ?, password_hash = ?, role_id = ? WHERE id = ?"; 
            values = [String(first_name), String(phone), String(email), hashedPassword, finalRoleId, userId]; 
        } else {
            sqlQuery = "UPDATE users SET first_name = ?, phone = ?, email = ?, role_id = ? WHERE id = ?"; 
            values = [String(first_name), String(phone), String(email), finalRoleId, userId]; 
        }

        db.query(sqlQuery, values, (err, result) => {
            if (err) {
                console.error("ОШИБКА UPDATE USER:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Этот Email уже занят другим пользователем" });
                }
                return res.status(500).json({ error: "Ошибка базы данных при обновлении профиля" });
            }
            res.json({ message: "Данные пользователя успешно обновлены" });
        });
    } catch (e) {
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, (req, res) => {
    const userId = req.params.id;
    const sqlQuery = "DELETE FROM users WHERE id = ?";

    db.query(sqlQuery, [userId], (err, result) => {
        if (err) {
            console.error("ОШИБКА DELETE USER:", err);
            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({ 
                    error: "Нельзя удалить пользователя, так как к нему привязаны активные заказы, отзывы или бронирования столов."
                });
            }
            return res.status(500).json({ error: "Ошибка при удалении пользователя из базы данных" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Пользователь с таким ID не найден" });
        }

        res.json({ message: "Пользователь успешно удален" });
    });
});

// Роут для обновления данных текущего пользователя
app.put("/api/user/profile", authenticateToken, async (req, res) => {
    // ID пользователя берется из middleware authenticateToken (req.user)
    const userId = req.user.id; 
    const { first_name, phone, email } = req.body;

    // Проверяем обязательные поля (если они у вас обязательны)
    if (!first_name || !phone || !email) {
        return res.status(400).json({ error: "Имя, телефон и email обязательны для заполнения" });
    }

    // Если в вашей таблице users изначально не было поля last_name, 
    // не забудьте добавить его в БД или убрать из этого запроса
    const sqlQuery = `
        UPDATE users 
        SET first_name = ?, phone = ?, email = ? 
        WHERE id = ?
    `;

    db.query(sqlQuery, [first_name, phone, email, userId], (err, result) => {
        if (err) {
            console.error("ОШИБКА ОБНОВЛЕНИЯ ПРОФИЛЯ:", err);
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ error: "Этот Email или телефон уже используются" });
            }
            return res.status(500).json({ error: "Ошибка при обновлении данных" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json({ message: "Данные успешно обновлены!" });
    });
});

// Получение данных текущего авторизованного пользователя
app.get("/api/user/profile", authenticateToken, (req, res) => {
    // ID достаем из токена, который обработал middleware authenticateToken
    const userId = req.user.id; 

    const sqlQuery = "SELECT first_name, email, phone FROM users WHERE id = ?";
    db.query(sqlQuery, [userId], (err, results) => {
        if (err) {
            console.error("ОШИБКА GET PROFILE:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        // Возвращаем объект пользователя { first_name, email, phone }
        res.json(results[0]); 
    });
});

// 1. Получить список всех столов для выпадающего списка формы
app.get("/api/tables", (req, res) => {
    const sqlQuery = "SELECT id, table_number, capacity FROM tables ORDER BY table_number ASC";
    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("ОШИБКА ПОЛУЧЕНИЯ СТОЛОВ:", err);
            return res.status(500).json({ error: "Не удалось загрузить список столов" });
        }
        res.json(results);
    });
});

// 2. Создать новое бронирование (Доступно авторизованному пользователю)
app.post("/api/reservations", authenticateToken, (req, res) => {
    // Получаем user_id из JWT-токена через middleware authenticateToken
    const userId = req.user.id; 
    const { tableId, reservationDate, reservationTime } = req.body;

    if (!tableId || !reservationDate || !reservationTime) {
        return res.status(400).json({ error: "Выберите столик, дату и время бронирования" });
    }

    // По умолчанию ставим статус 'pending' (ожидает подтверждения админом)
    const status = 'pending'; 

    const sqlQuery = `
        INSERT INTO reservations (user_id, table_id, reservation_date, reservation_time, status) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [userId, parseInt(tableId), reservationDate, reservationTime, status];

    db.query(sqlQuery, values, (err, result) => {
        if (err) {
            console.error("ОШИБКА СОЗДАНИЯ БРОНИ:", err);
            return res.status(500).json({ error: "Ошибка сервера при создании бронирования" });
        }
        res.status(201).json({ message: "Заявка на бронирование успешно отправлена!" });
    });
});


const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => console.log(`Бэкенд запущен на порту ${PORT}`));