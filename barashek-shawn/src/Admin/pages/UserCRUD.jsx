import React, { useState, useEffect } from "react";
import styles from "../AdminStyles.module.css";

export default function UserCRUD() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        first_name: "",
        phone: "",
        email: "",
        password: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            first_name: user.first_name || "",
            phone: user.phone || "",
            email: user.email || "",
            password: ""
        });
    };

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

    return (
        <div>
            <h2 className={styles.panelTitle}>Управление пользователями</h2>

            {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
            {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

            {/* Таблица пользователей */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Актуальный список пользователей</h3>
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
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.emptyRow}>Пользователи отсутствуют</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td><span className={styles.codeBadge}>{user.id}</span></td>
                                        <td style={{ fontWeight: 600, color: "#ffffff" }}>{user.first_name}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.email}</td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <button onClick={() => handleEdit(user)} className={`${styles.btnAction} ${styles.btnActionEdit}`} title="Редактировать">✏️</button>
                                            <button onClick={() => handleDelete(user.id)} className={`${styles.btnAction} ${styles.btnActionDelete}`} title="Удалить">🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Форма добавления/редактирования */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>
                    {editingId ? "✏️ Редактировать профиль" : "➕ Регистрация нового пользователя"}
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
                            <label>Пароль {editingId ? "(оставьте пустым для сохранения старого)" : "*"}</label>
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