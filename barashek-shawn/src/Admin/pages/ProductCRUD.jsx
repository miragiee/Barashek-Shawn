import React, { useState, useEffect } from "react";

export default function ProductCRUD() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Поля формы
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [weightG, setWeightG] = useState("");
    const [price, setPrice] = useState("");
    const [isAvailable, setIsAvailable] = useState(1);
    const [imagesUrl, setImagesUrl] = useState("");

    const [editingProductId, setEditingProductId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Поиск и фильтрация (как на вашем скриншоте)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // asc - старые сверху, desc - новые сверху

    // Токен авторизации для заголовков
    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    };

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = () => {
        fetch("http://localhost:5000/api/admin/products", {
            method: "GET",
            headers: getHeaders()
        })
        .then((res) => {
            if (res.status === 401 || res.status === 403) throw new Error("Доступ запрещен. Перезайтите в аккаунт.");
            return res.json();
        })
        .then((data) => {
            if (data.error) throw new Error(data.error);
            setProducts(data);
        })
        .catch((err) => setError(err.message));
    };

    const loadCategories = () => {
        fetch("http://localhost:5000/api/admin/categories", {
            method: "GET",
            headers: getHeaders()
        })
        .then((res) => res.json())
        .then((data) => {
            if (!data.error) setCategories(data);
        })
        .catch((err) => console.error(err));
    };

    const resetForm = () => {
        setName("");
        setCategoryId("");
        setDescription("");
        setWeightG("");
        setPrice("");
        setIsAvailable(1);
        setImagesUrl("");
        setEditingProductId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!name || !categoryId || !price) {
            setError("Пожалуйста, заполните обязательные поля");
            return;
        }

        const productData = {
            category_id: categoryId,
            name,
            description,
            weight_g: weightG,
            price,
            is_available: Number(isAvailable),
            images_url: imagesUrl
        };

        const url = editingProductId 
            ? `http://localhost:5000/api/admin/products/${editingProductId}`
            : "http://localhost:5000/api/admin/products";

        const method = editingProductId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(productData)
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) throw new Error(data.error);
            setMessage(editingProductId ? "Блюдо обновлено!" : "Блюдо добавлено!");
            resetForm();
            loadProducts();
        })
        .catch((err) => setError(err.message));
    };

    const handleEdit = (product) => {
        setEditingProductId(product.id);
        setName(product.name);
        setCategoryId(product.category_id);
        setDescription(product.description || "");
        setWeightG(product.weight_g || "");
        setPrice(product.price);
        setIsAvailable(product.is_available);
        setImagesUrl(product.image_url || "");
        
        // Плавный скролл к форме редактирования
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (!window.confirm("Удалить это блюдо?")) return;
        setError("");
        setMessage("");

        fetch(`http://localhost:5000/api/admin/products/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) throw new Error(data.error);
            setMessage("Блюдо удалено успешно");
            loadProducts();
        })
        .catch((err) => setError(err.message));
    };

    // Логика фильтрации и поиска на фронтенде для соответствия вашему интерфейсу
    const filteredProducts = products
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategoryFilter === "" || String(p.category_id) === String(selectedCategoryFilter);
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
        });

    return (
        <div style={{ flex: 1, padding: "40px 24px", color: "#fff", fontFamily: "sans-serif", boxSizing: "border-box" }}>
            
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px", marginTop: 0 }}>
                Управление товарами (Блюдами)
            </h1>

            {error && <div style={{ background: "rgba(220,53,69,0.2)", color: "#dc3545", border: "1px solid #dc3545", padding: "12px", borderRadius: "6px", marginBottom: "20px" }}>{error}</div>}
            {message && <div style={{ background: "rgba(40,167,69,0.2)", color: "#28a745", border: "1px solid #28a745", padding: "12px", borderRadius: "6px", marginBottom: "20px" }}>{message}</div>}

            {/* БЛОК 1: АКТУАЛЬНОЕ МЕНЮ В БАЗЕ ДАННЫХ */}
            <div style={{ background: "#151515", border: "1px solid #222", borderRadius: "12px", padding: "24px", marginBottom: "30px" }}>
                
                <h2 style={{ fontSize: "20px", color: "#ffc107", marginTop: 0, marginBottom: "20px", fontWeight: "600" }}>
                    Актуальное меню в базе данных
                </h2>

                {/* Панель фильтров (Инпуты из вашего скрина) */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                    <input 
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "12px 16px", color: "#fff", fontSize: "14px" }}
                    />
                    
                    <select 
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "12px 16px", color: "#fff", fontSize: "14px", width: "180px" }}
                    >
                        <option value="">Все категории</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "12px 16px", color: "#fff", fontSize: "14px", width: "200px" }}
                    >
                        <option value="asc">Старые сверху (ID ▲)</option>
                        <option value="desc">Новые сверху (ID ▼)</option>
                    </select>
                </div>

                {/* Таблица блюд */}
                <table style={{ width: "100%", borderCollapse: "collapse", color: "#aaa", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #2a2a2a", textAlign: "left" }}>
                            <th style={{ padding: "12px 8px", color: "#ffc107", fontWeight: "500", width: "50px" }}>ID</th>
                            <th style={{ padding: "12px 8px", color: "#fff", fontWeight: "500" }}>Название</th>
                            <th style={{ padding: "12px 8px", color: "#fff", fontWeight: "500" }}>Категория</th>
                            <th style={{ padding: "12px 8px", color: "#fff", fontWeight: "500", textAlign: "right" }}>Цена</th>
                            <th style={{ padding: "12px 8px", color: "#fff", fontWeight: "500", textAlign: "center" }}>Вес</th>
                            <th style={{ padding: "12px 8px", color: "#fff", fontWeight: "500", textAlign: "center" }}>Статус</th>
                            <th style={{ padding: "12px 8px", color: "#fff", fontWeight: "500", textAlign: "center", width: "100px" }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} style={{ borderBottom: "1px solid #1f1f1f" }}>
                                <td style={{ padding: "16px 8px", color: "#666" }}>{product.id}</td>
                                <td style={{ padding: "16px 8px", color: "#fff", fontWeight: "500" }}>{product.name}</td>
                                <td style={{ padding: "16px 8px" }}>{product.category_name}</td>
                                <td style={{ padding: "16px 8px", textAlign: "right", color: "#ffc107", fontWeight: "bold" }}>
                                    {parseFloat(product.price).toFixed(2)} ₽
                                </td>
                                <td style={{ padding: "16px 8px", textAlign: "center" }}>{product.weight_g} г</td>
                                <td style={{ padding: "16px 8px", textAlign: "center" }}>
                                    <span style={{ color: product.is_available ? "#28a745" : "#dc3545", fontWeight: "500" }}>
                                        {product.is_available ? "Доступно" : "Скрыто"}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 8px", textAlign: "center" }}>
                                    <button 
                                        onClick={() => handleEdit(product)}
                                        style={{ background: "#ffc107", border: "none", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", marginRight: "8px", color: "#000" }}
                                        title="Редактировать"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product.id)}
                                        style={{ background: "#dc3545", border: "none", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", color: "#fff" }}
                                        title="Удалить"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#555" }}>Блюда не найдены</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* БЛОК 2: ДОБАВИТЬ НОВОЕ БЛЮДО */}
            <div style={{ background: "#151515", border: "1px solid #222", borderRadius: "12px", padding: "24px" }}>
                
                <h2 style={{ fontSize: "20px", color: "#ffc107", marginTop: 0, marginBottom: "24px", fontWeight: "600" }}>
                    {editingProductId ? "✏️ Редактировать блюдо" : "Добавить новое блюдо"}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    <div>
                        <label style={{ display: "block", fontSize: "14px", color: "#aaa", marginBottom: "8px" }}>Категория меню *</label>
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            style={{ width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", boxSizing: "border-box" }}
                        >
                            <option value="">-- Выберите категорию --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", color: "#aaa", marginBottom: "8px" }}>Название *</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название блюда"
                            style={{ width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", color: "#aaa", marginBottom: "8px" }}>Описание блюда</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Опишите состав, вкус или подачу..."
                            style={{ width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", boxSizing: "border-box", minHeight: "100px", resize: "vertical" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: "14px", color: "#aaa", marginBottom: "8px" }}>Цена (руб.) *</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                style={{ width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", boxSizing: "border-box" }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: "block", fontSize: "14px", color: "#aaa", marginBottom: "8px" }}>Вес (г)</label>
                            <input 
                                type="number"
                                value={weightG}
                                onChange={(e) => setWeightG(e.target.value)}
                                placeholder="0"
                                style={{ width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", boxSizing: "border-box" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", color: "#aaa", marginBottom: "8px" }}>URL Изображения</label>
                        <input 
                            type="text"
                            value={imagesUrl}
                            onChange={(e) => setImagesUrl(e.target.value)}
                            placeholder="https://example.com/image.png"
                            style={{ width: "100%", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", boxSizing: "border-box" }}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                        <input 
                            type="checkbox"
                            id="isAvailableCheckbox"
                            checked={isAvailable === 1}
                            onChange={(e) => setIsAvailable(e.target.checked ? 1 : 0)}
                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <label htmlFor="isAvailableCheckbox" style={{ fontSize: "14px", color: "#ddd", cursor: "pointer" }}>
                            Доступно для заказа (показывать в меню сайта)
                        </label>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                        <button 
                            type="submit"
                            style={{ background: "#ffc107", color: "#000", border: "none", borderRadius: "8px", padding: "14px 28px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}
                        >
                            {editingProductId ? "Сохранить изменения" : "Добавить блюдо в базу"}
                        </button>
                        
                        {editingProductId && (
                            <button 
                                type="button"
                                onClick={resetForm}
                                style={{ background: "transparent", color: "#aaa", border: "1px solid #444", borderRadius: "8px", padding: "14px 24px", fontSize: "15px", cursor: "pointer" }}
                            >
                                Отмена
                            </button>
                        )}
                    </div>

                </form>
            </div>

        </div>
    );
}