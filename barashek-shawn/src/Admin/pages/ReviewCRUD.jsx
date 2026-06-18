import React, { useState, useEffect } from "react";
import styles from "../AdminStyles.module.css";

export default function ReviewsCRUD() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filterRating, setFilterRating] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const API_REVIEWS = "http://localhost:5000/api/admin/reviews";

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_REVIEWS);
            if (!response.ok) throw new Error("Не удалось загрузить отзывы");
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Удалить этот отзыв окончательно?")) return;
        setError(null);
        setSuccessMessage("");
        try {
            const response = await fetch(`${API_REVIEWS}/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Ошибка при удалении");
            setSuccessMessage("Отзыв успешно удален из системы!");
            fetchReviews();
        } catch (err) {
            setError(err.message);
        }
    };

    // Безопасная фильтрация отзывов (с защитой от NULL значений в БД)
    const filteredReviews = reviews.filter((rev) => {
        const commentText = rev.comment ? String(rev.comment).toLowerCase() : "";
        const firstNameText = rev.first_name ? String(rev.first_name).toLowerCase() : "";
        const productNameText = rev.product_name ? String(rev.product_name).toLowerCase() : "";
        
        const search = searchTerm.toLowerCase();

        const matchesSearch = commentText.includes(search) || 
                              firstNameText.includes(search) ||
                              productNameText.includes(search);
                              
        const matchesRating = filterRating === "" || rev.rating === parseInt(filterRating);
        return matchesSearch && matchesRating;
    });


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    return (
        <div>
            <h2 className={styles.panelTitle}>Модерация отзывов</h2>

            {error && <div className={`${styles.alert} ${styles.alertError}`}>⚠️ {error}</div>}
            {successMessage && <div className={`${styles.alert} ${styles.alertSuccess}`}>✅ {successMessage}</div>}

            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Отзывы покупателей о блюдах</h3>

                <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Поиск по комментарию, имени гостя или блюду..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div style={{ width: "200px" }}>
                        <select
                            className={styles.inputField}
                            value={filterRating}
                            onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">Все оценки</option>
                            <option value="5">5 Звезд</option>
                            <option value="4">4 Звезды</option>
                            <option value="3">3 Звезды</option>
                            <option value="2">2 Звезды</option>
                            <option value="1">1 Звезда</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p style={{ color: "#aaaaaa" }}>Загрузка отзывов...</p>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.crudTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Гость</th>
                                    <th>Блюдо</th>
                                    <th>Оценка</th>
                                    <th>Комментарий</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((rev) => (
                                    <tr key={rev.id}>
                                        <td>{rev.id}</td>
                                        <td>
                                            <strong>{rev.first_name}</strong>
                                            <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "4px" }}>{rev.email}</div>
                                        </td>
                                        <td><span className={styles.codeBadge}>{rev.product_name}</span></td>
                                        <td style={{ color: "#ffc107", fontWeight: "bold", fontSize: "1.1rem" }}>
                                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                                        </td>
                                        <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>
                                            {rev.comment || rev.text || rev.review_text || rev.content || (
                                                <span style={{ color: "#666", fontSize: "0.85rem", fontStyle: "italic" }}>
                                                    Текст пуст (Ключи: {Object.keys(rev).filter(k => k.includes("text") || k.includes("comm") || k.includes("content")).join(", ") || "не найдены"})
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <button 
                                                className={styles.btn} 
                                                onClick={() => handleDeleteReview(rev.id)}
                                                style={{ backgroundColor: "#dc3545", color: "#fff", padding: "6px 12px" }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className={styles.emptyRow}>Отзывов по заданным критериям не найдено</td>
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
        </div>
    );
}
