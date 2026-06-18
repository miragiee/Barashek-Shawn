import React, { useState, useEffect } from "react";
import styles from "../AdminStyles.module.css";

export default function CategoriesCRUD() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    // Сортировка по умолчанию установлена по ID по возрастанию (id-asc)
    const [sortOrder, setSortOrder] = useState("id-asc"); 
    const itemsPerPage = 5;

    const API_URL = "http://localhost:5000/api/admin/categories";

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Не удалось загрузить категории");
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setName("");
        setSlug("");
        setEditingCategoryId(null);
    };

    const handleEditClick = (category) => {
        setEditingCategoryId(category.id);
        setName(category.name);
        setSlug(category.slug);
        setError(null);
        setSuccessMessage("");
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить эту категорию?")) return;
        setError(null);
        setSuccessMessage("");
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ошибка удаления");
            setSuccessMessage("Категория успешно удалена!");
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !slug) {
            setError("Заполните все поля!");
            return;
        }
        setError(null);
        setSuccessMessage("");

        const url = editingCategoryId ? `${API_URL}/${editingCategoryId}` : API_URL;
        const method = editingCategoryId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ошибка при сохранении");

            setSuccessMessage(editingCategoryId ? "Категория обновлена!" : "Категория создана!");
            resetForm();
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        if (!editingCategoryId) {
            const generatedSlug = val
                .toLowerCase()
                .replace(/[^a-z0-9а-я\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
            setSlug(generatedSlug);
        }
    };

    const filteredCategories = categories.filter((cat) => {
        const matchesName = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSlug = cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesId = String(cat.id).includes(searchTerm);
        return matchesName || matchesSlug || matchesId;
    });

    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (sortOrder === "id-asc") return a.id - b.id;
        if (sortOrder === "id-desc") return b.id - a.id;
        if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
        if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    return (
        <div>
            <h2 className={styles.panelTitle}>Управление категориями</h2>

            {error && <div className={`${styles.alert} ${styles.alertError}`}>⚠️ {error}</div>}
            {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>✅ {successMessage}</div>}

            {/* КАРТОЧКА 1: ТАБЛИЦА */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Список категорий в базе данных</h3>
                
                <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Поиск по названию, ID или slug..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div style={{ width: "220px" }}>
                        <select
                            className={styles.inputField}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="id-asc">Старые сверху (ID ▲)</option>
                            <option value="id-desc">Новые сверху (ID ▼)</option>
                            <option value="name-asc">Алфавит (А-Я ▲)</option>
                            <option value="name-desc">Алфавит (Я-А ▼)</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p>Загрузка данных...</p>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.crudTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Slug (Ссылка)</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((category) => (
                                    <tr key={category.id}>
                                        <td>{category.id}</td>
                                        <td><strong>{category.name}</strong></td>
                                        <td><span className={styles.codeBadge}>{category.slug}</span></td>
                                        <td>
                                            <button 
                                                className={styles.btn} 
                                                onClick={() => handleEditClick(category)}
                                                style={{ backgroundColor: "#ffc107", color: "#121212", marginRight: "8px", padding: "6px 12px" }}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className={styles.btn} 
                                                onClick={() => handleDelete(category.id)}
                                                style={{ backgroundColor: "#dc3545", color: "#fff", padding: "6px 12px" }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className={styles.emptyRow}>Категорий не найдено</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                                <button 
                                    className={styles.btn} 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    style={{ padding: "6px 12px", backgroundColor: "#262626", color: "#fff" }}
                                >
                                    Назад
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        className={styles.btn}
                                        onClick={() => setCurrentPage(i + 1)}
                                        style={{ 
                                            padding: "6px 12px", 
                                            backgroundColor: currentPage === i + 1 ? "#ffc107" : "#262626",
                                            color: currentPage === i + 1 ? "#121212" : "#fff"
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    className={styles.btn} 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    style={{ padding: "6px 12px", backgroundColor: "#262626", color: "#fff" }}
                                >
                                    Вперед
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* КАРТОЧКА 2: ФОРМА */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>
                    {editingCategoryId ? `Редактировать категорию (ID: ${editingCategoryId})` : "Добавить новую категорию"}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Название категории:</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Например: Баранина"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Slug (для URL ссылки):</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="Например: baranina"
                        />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                            {editingCategoryId ? "Сохранить изменения" : "Сохранить категорию"}
                        </button>
                        {editingCategoryId && (
                            <button type="button" className={styles.btn} onClick={resetForm} style={{ backgroundColor: "#444" }}>
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
