import React, { useState, useEffect } from "react";
import styles from "../AdminStyles.module.css";

export default function ReservationsCRUD() {
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [users, setUsers] = useState([]); // Для выбора гостя в форме создания
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Поля формы создания / полного редактирования
    const [userId, setUserId] = useState("");
    const [tableId, setTableId] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [guestCount, setGuestCount] = useState("");
    const [status, setStatus] = useState("новое");
    const [editingReservationId, setEditingReservationId] = useState(null);

    // Сортировка, пагинация, фильтрация
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sortOrder, setSortOrder] = useState("id-asc"); // По умолчанию по ID по возрастанию
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const API_RESERVATIONS = "http://localhost:5000/api/admin/reservations";
    const API_TABLES = "http://localhost:5000/api/admin/tables";
    const API_USERS = "http://localhost:5000/api/admin/users"; // Предполагаем наличие роута пользователей

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resRes, tablesRes] = await Promise.all([
                fetch(API_RESERVATIONS),
                fetch(API_TABLES)
            ]);
            if (!resRes.ok || !tablesRes.ok) throw new Error("Ошибка при загрузке данных бронирования");
            setReservations(await resRes.json());
            setTables(await tablesRes.json());
            
            // Загружаем пользователей для селекта в форме (мягкий фолбек, если роута нет)
            const usersRes = await fetch("http://localhost:5000/api/admin/users").catch(() => null);
            if (usersRes && usersRes.ok) setUsers(await usersRes.json());
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
        setUserId("");
        setTableId("");
        setReservationDate("");
        setReservationTime("");
        setGuestCount("");
        setStatus("новое");
        setEditingReservationId(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить это бронирование?")) return;
        setError(null);
        setSuccessMessage("");
        try {
            const response = await fetch(`${API_RESERVATIONS}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Не удалось удалить бронирование");
            setSuccessMessage("Бронирование успешно удалено!");
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };
    const handleEditClick = (res) => {
        setEditingReservationId(res.id);
        setUserId(res.user_id || "");
        setTableId(res.table_id || "");
        // Форматируем дату под input type="date" (YYYY-MM-DD)
        const dateObj = new Date(res.reservation_date);
        const formattedDate = dateObj.toISOString().split("T")[0];
        setReservationDate(formattedDate);
        setReservationTime(res.reservation_time.slice(0, 5));
        setGuestCount(res.guest_count);
        setStatus(res.status);
        setError(null);
        setSuccessMessage("");
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };

    const handleQuickStatusOrTableUpdate = async (id, currentStatus, currentTableId) => {
        try {
            const response = await fetch(`${API_RESERVATIONS}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: currentStatus, table_id: currentTableId ? parseInt(currentTableId) : null })
            });
            if (!response.ok) throw new Error("Ошибка быстрого обновления");
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !reservationDate || !reservationTime || !guestCount) {
            setError("Заполните обязательные поля: Гость, Дата, Время, Количество мест!");
            return;
        }
        setError(null);
        setSuccessMessage("");

        const payload = {
            user_id: parseInt(userId),
            table_id: tableId ? parseInt(tableId) : null,
            reservation_date: reservationDate,
            reservation_time: reservationTime + ":00",
            guest_count: parseInt(guestCount),
            status
        };

        const url = editingReservationId ? `${API_RESERVATIONS}/${editingReservationId}` : API_RESERVATIONS;
        try {
            const response = await fetch(url, {
                method: editingReservationId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Ошибка при сохранении бронирования");
            setSuccessMessage(editingReservationId ? "Бронирование успешно обновлено!" : "Бронирование успешно создано!");
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch = res.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || res.phone.includes(searchTerm);
        const matchesStatus = filterStatus === "" || res.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const sortedReservations = [...filteredReservations].sort((a, b) => {
        if (sortOrder === "id-asc") return a.id - b.id;
        if (sortOrder === "id-desc") return b.id - a.id;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedReservations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedReservations.length / itemsPerPage);
    return (
        <div>
            <h2 className={styles.panelTitle}>Управление бронированием столов (CRUD)</h2>

            {error && <div className={`${styles.alert} ${styles.alertError}`}>⚠️ {error}</div>}
            {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>✅ {successMessage}</div>}

            {/* КАРТОЧКА 1: ТАБЛИЦА ВЕРХУ */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Входящие заявки на бронь</h3>
                <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <input type="text" className={styles.inputField} placeholder="Поиск по имени или телефону..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                    <div style={{ width: "160px" }}>
                        <select className={styles.inputField} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                            <option value="">Все статусы</option>
                            <option value="новое">Новое</option>
                            <option value="подтверждено">Подтверждено</option>
                            <option value="отменено">Отменено</option>
                        </select>
                    </div>
                    <div style={{ width: "200px" }}>
                        <select className={styles.inputField} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="id-asc">Старые сверху (ID ▲)</option>
                            <option value="id-desc">Новые сверху (ID ▼)</option>
                        </select>
                    </div>
                </div>

                {loading ? <p style={{ color: "#aaaaaa" }}>Загрузка...</p> : (
                    <div className={styles.tableContainer}>
                        <table className={styles.crudTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Гость / Телефон</th>
                                    <th>Дата и Время</th>
                                    <th>Мест</th>
                                    <th>Стол</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((res) => (
                                    <tr key={res.id}>
                                        <td>{res.id}</td>
                                        <td><strong>{res.first_name}</strong><div style={{ fontSize: "0.85rem", color: "#aaa", marginTop: "4px" }}>{res.phone}</div></td>
                                        <td><div>{new Date(res.reservation_date).toLocaleDateString("ru-RU")}</div><div style={{ color: "#ffc107", fontSize: "0.9rem", marginTop: "4px" }}>{res.reservation_time.slice(0, 5)}</div></td>
                                        <td>{res.guest_count} чел.</td>
                                        <td>
                                            <select className={styles.inputField} style={{ padding: "6px", fontSize: "0.9rem", minWidth: "130px" }} value={res.table_id || ""} onChange={(e) => handleQuickStatusOrTableUpdate(res.id, res.status, e.target.value)}>
                                                <option value="">-- Не назначен --</option>
                                                {tables.map(t => <option key={t.id} value={t.id}>№{t.table_number} (до {t.capacity} чел)</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <select className={styles.inputField} style={{ padding: "6px", fontSize: "0.9rem", fontWeight: "bold" }} value={res.status} onChange={(e) => handleQuickStatusOrTableUpdate(res.id, e.target.value, res.table_id)}>
                                                <option value="новое">Новое</option>
                                                <option value="подтверждено">Подтверждено</option>
                                                <option value="отменено">Отменено</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button className={styles.btn} onClick={() => handleEditClick(res)} style={{ backgroundColor: "#ffc107", color: "#121212", marginRight: "6px", padding: "6px 10px" }}>✏️</button>
                                            <button className={styles.btn} onClick={() => handleDelete(res.id)} style={{ backgroundColor: "#dc3545", padding: "6px 10px" }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "center" }}>
                                <button className={styles.btn} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: "6px 12px", backgroundColor: "#262626" }}>Назад</button>
                                {[...Array(totalPages)].map((_, i) => <button key={i + 1} className={styles.btn} onClick={() => setCurrentPage(i + 1)} style={{ padding: "6px 12px", backgroundColor: currentPage === i + 1 ? "#ffc107" : "#262626", color: currentPage === i + 1 ? "#121212" : "#fff" }}>{i + 1}</button>)}
                                <button className={styles.btn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: "6px 12px", backgroundColor: "#262626" }}>Вперед</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* КАРТОЧКА 2: ФОРМА СНИЗУ */}
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>{editingReservationId ? `Редактировать бронь (ID: ${editingReservationId})` : "Оформить бронь вручную"}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Выбрать гостя (User ID) *</label>
                        <select className={styles.inputField} value={userId} onChange={(e) => setUserId(e.target.value)}>
                            <option value="">-- Выберите аккаунт гостя --</option>
                            {users.length > 0 ? users.map(u => <option key={u.id} value={u.id}>{u.first_name} ({u.phone})</option>) : reservations.map(r => <option key={r.id} value={r.user_id}>{r.first_name} ({r.phone})</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Дата визита *</label>
                            <input type="date" className={styles.inputField} value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Время визита *</label>
                            <input type="time" className={styles.inputField} value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Количество гостей *</label>
                            <input type="number" className={styles.inputField} value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="Кол-во персон" />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label>Назначить стол</label>
                            <select className={styles.inputField} value={tableId} onChange={(e) => setTableId(e.target.value)}>
                                <option value="">-- Не назначен --</option>
                                {tables.map(t => <option key={t.id} value={t.id}>Стол №{t.table_number} (до {t.capacity} чел)</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Статус заявки</label>
                        <select className={styles.inputField} value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="новое">Новое</option>
                            <option value="подтверждено">Подтверждено</option>
                            <option value="отменено">Отменено</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>{editingReservationId ? "Сохранить изменения" : "Оформить бронирование"}</button>
                        {editingReservationId && <button type="button" className={styles.btn} onClick={resetForm} style={{ backgroundColor: "#444444", color: "#ffffff" }}>Отмена</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}