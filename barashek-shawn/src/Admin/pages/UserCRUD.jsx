import React, { useState, useEffect } from "react";
import styles from "../AdminStyles.module.css";

export default function UserCRUD() {
    // Состояния для данных
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        first_name: "",
        phone: "",
        email: "",
        password: ""
    });
    
    // Состояния для управления UI/процессами
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Состояния для фильтрации, сортировки и пагинации
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" — старые сверху (ID ▲), "desc" — новые сверху (ID ▼)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Количество пользователей на одной странице

    // Загрузка списка пользователей с бэкенда
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/users");
            if (!response.ok) throw new Error("Не удалось загрузить пользователей");
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Обработчик изменения полей ввода формы
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Отправка формы (Создание или Редактирование)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const isEditing = editingId !== null;
        const url = isEditing 
            ? `http://localhost:5000/api/admin/users/${editingId}`
            : "http://localhost:5000/api/admin/users";
        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Ошибка при сохранении данных");

            setSuccess(isEditing ? "Данные пользователя успешно обновлены!" : "Пользователь успешно создан!");
            setFormData({ first_name: "", phone: "", email: "", password: "" });
            setEditingId(null);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // Клик по кнопке "Редактировать" (заполнение формы данными)
    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            first_name: user.first_name || "",
            phone: user.phone || "",
            email: user.email || "",
            password: "" // оставляем пустым, если админ не хочет менять пароль
        });
        // Скролл к форме для удобства
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    // Удаление пользователя с подтверждением
    const handleDelete = async (id) => {
        if (!window.confirm("Вы действительно хотите удалить этого пользователя?")) return;
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: "DELETE"
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Ошибка при удалении");

            setSuccess("Пользователь успешно удален");
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // ==========================================
    // ЛОГИКА ФИЛЬТРАЦИИ, СОРТИРОВКИ И ПАГИНАЦИИ
    // ==========================================

    // 1. Фильтрация по поисковому запросу
    const filteredUsers = users.filter((user) => {
        const firstNameText = user.first_name ? String(user.first_name).toLowerCase() : "";
        const phoneText = user.phone ? String(user.phone).toLowerCase() : "";
        const emailText = user.email ? String(user.email).toLowerCase() : "";
        const search = searchTerm.toLowerCase();

        return firstNameText.includes(search) || 
               phoneText.includes(search) || 
               emailText.includes(search);
    });

    // 2. Сортировка по ID
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortOrder === "desc") {
            return b.id - a.id; // Новые сверху
        }
        return a.id - b.id; // Старые сверху
    });

    // 3. Вычисление среза данных для текущей страницы пагинации
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

    return (
        <div>
            <h2 className={styles.panelTitle}>Управление пользователями</h2>

            {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
            {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

            {/* Карточка со списком пользователей и фильтрами */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Актуальный список пользователей</h3>
                
                {/* Панель фильтров (Поиск + Сортировка) */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Поиск по имени, телефону или email..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className={styles.inputField}
                        />
                    </div>
                    <div style={{ width: "240px" }}>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className={styles.inputField}
                            style={{ cursor: "pointer" }}
                        >
                            <option value="asc">Старые сверху (ID ▲)</option>
                            <option value="desc">Новые сверху (ID ▼)</option>
                        </select>
                    </div>
                </div>

                {/* Таблица */}
                <div className={styles.tableContainer}>
                    <table className={styles.crudTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Телефон</th>
                                <th>Email</th>
                                <th>Дата регистрации</th>
                                <th style={{ textAlign: "center" }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.emptyRow}>Пользователи не найдены</td>
                                </tr>
                            ) : (
                                currentItems.map((user) => (
                                    <tr key={user.id}>
                                        <td><span className={styles.codeBadge}>{user.id}</span></td>
                                        <td style={{ fontWeight: 600, color: "#ffffff" }}>{user.first_name}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.email}</td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <button 
                                                onClick={() => handleEdit(user)} 
                                                className={`${styles.btnAction} ${styles.btnActionEdit}`} 
                                                title="Редактировать"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)} 
                                                className={`${styles.btnAction} ${styles.btnActionDelete}`} 
                                                title="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Блок пагинации (Рендерится, если страниц больше одной) */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        >
                            Назад
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`${styles.btn} ${currentPage === page ? styles.btnPrimary : styles.btnSecondary}`}
                                style={{ padding: "8px 14px", fontSize: "0.9rem" }}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        >
                            Вперед
                        </button>
                    </div>
                )}
            </div>

            {/* Карточка формы добавления/редактирования */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>
                    {editingId ? "✏️ Редактировать профиль пользователя" : "➕ Регистрация нового пользователя"}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Имя пользователя *</label>
                            <input
                                type="text"
                                name="first_name"
                                className={styles.inputField}
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Введите имя"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Номер телефона *</label>
                            <input
                                type="text"
                                name="phone"
                                className={styles.inputField}
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength="15"
                                placeholder="+7 (999) 000-00-00"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Электронная почта (Email) *</label>
                            <input
                                type="email"
                                name="email"
                                className={styles.inputField}
                                value={formData.email}
                                onChange={handleChange}
                                maxLength="100"
                                placeholder="example@domain.com"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Пароль {editingId ? "(оставьте пустым для сохранения текущего)" : "*"}</label>
                            <input
                                type="password"
                                name="password"
                                className={styles.inputField}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={editingId ? "••••••••" : "Задайте пароль"}
                                required={!editingId}
                            />
                        </div>
                    </div>

                    <div className={styles.formButtonsGroup}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                            {editingId ? "Сохранить изменения" : "Добавить пользователя"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ first_name: "", phone: "", email: "", password: "" });
                                }}
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