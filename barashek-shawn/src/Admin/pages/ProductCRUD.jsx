import React, { useState, useEffect } from "react";
import styles from "../AdminStyles.module.css";

export default function ProductsCRUD() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Состояния полей формы для таблицы products
    const [categoryId, setCategoryId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [weightG, setWeightG] = useState("");
    const [price, setPrice] = useState("");
    const [isAvailable, setIsAvailable] = useState(1);
    const [imagesUrl, setImagesUrl] = useState("");

    // Хранит ID редактируемого товара, либо null
    const [editingProductId, setEditingProductId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Пагинация, фильтрация и сортировка
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("id-asc"); // По умолчанию: по ID по возрастанию
    const [filterCategory, setFilterCategory] = useState("");
    const itemsPerPage = 5;

    const API_PRODUCTS = "http://localhost:5000/api/admin/products";
    const API_CATEGORIES = "http://localhost:5000/api/admin/categories";

    // Получение данных с сервера
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch(API_PRODUCTS),
                fetch(API_CATEGORIES)
            ]);

            if (!prodRes.ok || !catRes.ok) throw new Error("Ошибка при получении данных с бэкенда");

            const prodData = await prodRes.json();
            const catData = await catRes.json();

            setProducts(prodData);
            setCategories(catData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setCategoryId("");
        setName("");
        setDescription("");
        setWeightG("");
        setPrice("");
        setIsAvailable(1);
        setImagesUrl("");
        setEditingProductId(null);
    };
    const handleEditClick = (product) => {
        setEditingProductId(product.id);
        setCategoryId(product.category_id);
        setName(product.name);
        setDescription(product.description || "");
        setWeightG(product.weight_g || "");
        setPrice(product.price);
        setIsAvailable(product.is_available);
        setImagesUrl(product.images_url || product.image_url || "");
        setError(null);
        setSuccessMessage("");
        
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId || !name || !price) {
            setError("Поля Категория, Название и Цена обязательны!");
            return;
        }

        setError(null);
        setSuccessMessage("");

        const payload = {
            category_id: parseInt(categoryId),
            name,
            description: description || null,
            weight_g: weightG ? parseInt(weightG) : null,
            price: parseFloat(price),
            is_available: isAvailable === 1 || isAvailable === "1" ? 1 : 0,
            images_url: imagesUrl || null
        };

        const url = editingProductId ? `${API_PRODUCTS}/${editingProductId}` : API_PRODUCTS;
        const method = editingProductId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Не удалось сохранить изменения");

            setSuccessMessage(editingProductId ? "Блюдо успешно обновлено!" : "Блюдо успешно добавлено в меню!");
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить это блюдо из базы данных?")) return;

        setError(null);
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_PRODUCTS}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ошибка при удалении");

            setSuccessMessage("Товар успешно удален!");
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    // Логика фильтрации
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === "" || product.category_id === parseInt(filterCategory);
        return matchesSearch && matchesCategory;
    });

    // Логика сортировки
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === "id-asc") return a.id - b.id;
        if (sortOrder === "id-desc") return b.id - a.id;
        if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
        if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
        if (sortOrder === "price-asc") return a.price - b.price;
        if (sortOrder === "price-desc") return b.price - a.price;
        return 0;
    });

    // Расчет пагинации (по 5 элементов)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    return (
        <div>
            <h2 className={styles.panelTitle}>Управление товарами (Блюдами)</h2>

            {error && <div className={`${styles.alert} ${styles.alertError}`}>⚠️ {error}</div>}
            {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>✅ {successMessage}</div>}

            {/* КАРТОЧКА 1: ТАБЛИЦА МЕНЮ С ПАГИНАЦИЕЙ */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Актуальное меню в базе данных</h3>
                
                <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Поиск по названию или описанию..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div style={{ width: "200px" }}>
                        <select
                            className={styles.inputField}
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">Все категории</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ width: "220px" }}>
                        <select className={styles.inputField} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="id-asc">Старые сверху (ID ▲)</option>
                            <option value="id-desc">Новые сверху (ID ▼)</option>
                            <option value="name-asc">Название (А-Я ▲)</option>
                            <option value="name-desc">Название (Я-А ▼)</option>
                            <option value="price-asc">Сначала дешевые (₽ ▲)</option>
                            <option value="price-desc">Сначала дорогие (₽ ▼)</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p style={{ color: "#aaaaaa" }}>Загрузка списка блюд...</p>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.crudTable}>
                            <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Категория</th>
                                    <th>Цена</th>
                                    <th>Вес</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <img 
                                                src={`http://localhost:3000/${product.images_url || product.image_url}`} 
                                                alt="" 
                                                style={{ width: "55px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                                                onError={(e) => { e.target.src = "https://placehold.co"; }}
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td><strong>{product.name}</strong></td>
                                        <td>{product.category_name}</td>
                                        <td style={{ color: "#ffc107", fontWeight: "600" }}>{product.price} ₽</td>
                                        <td>{product.weight_g ? `${product.weight_g} г` : "—"}</td>
                                        <td>
                                            <span style={{ color: product.is_available ? "#28a745" : "#dc3545", fontWeight: "bold" }}>
                                                {product.is_available ? "Доступно" : "Скрыто"}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.btn} onClick={() => handleEditClick(product)} style={{ backgroundColor: "#ffc107", color: "#121212", marginRight: "8px", padding: "6px 12px" }}>✏️</button>
                                            <button className={styles.btn} onClick={() => handleDelete(product.id)} style={{ backgroundColor: "#dc3545", padding: "6px 12px" }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className={styles.emptyRow}>Блюд не найдено</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                                <button className={styles.btn} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: "6px 12px", backgroundColor: "#262626", color: "#fff" }}>Назад</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} className={styles.btn} onClick={() => setCurrentPage(i + 1)} style={{ padding: "6px 12px", backgroundColor: currentPage === i + 1 ? "#ffc107" : "#262626", color: currentPage === i + 1 ? "#121212" : "#fff" }}>{i + 1}</button>
                                ))}
                                <button className={styles.btn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: "6px 12px", backgroundColor: "#262626", color: "#fff" }}>Вперед</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>
                    {editingProductId ? `Редактировать блюдо` : `Добавить новое блюдо`}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Категория меню *</label>
                        <select className={styles.inputField} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">-- Выберите категорию --</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Название *</label>
                        <input type="text" className={styles.inputField} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Описание</label>
                        <textarea className={styles.inputField} value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
                    </div>

                    <div style={{ display: "flex", gap: "20px" }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Цена *</label>
                            <input type="number" step="0.01" className={styles.inputField} value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Вес (г)</label>
                            <input type="number" className={styles.inputField} value={weightG} onChange={(e) => setWeightG(e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Путь к изображению</label>
                        <input type="text" className={styles.inputField} value={imagesUrl} onChange={(e) => setImagesUrl(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Доступность для заказа</label>
                        <select className={styles.inputField} value={isAvailable} onChange={(e) => setIsAvailable(parseInt(e.target.value))}>
                            <option value={1}>Доступно</option>
                            <option value={0}>Скрыто</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                            {editingProductId ? "Сохранить изменения" : "Добавить в меню"}
                        </button>
                        {editingProductId && (
                            <button type="button" className={styles.btn} onClick={resetForm} style={{ backgroundColor: "#444444", color: "#ffffff" }} >
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
