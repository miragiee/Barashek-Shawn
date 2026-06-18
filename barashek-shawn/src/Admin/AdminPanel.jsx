import React, { useState, useEffect } from "react"; // Исправлено: добавлен useEffect
import { useNavigate } from "react-router-dom"; // Исправлено: добавлен useNavigate
import CategoriesCRUD from "./pages/CategoriesCRUD";
import ProductsCRUD from "./pages/ProductCRUD";
import ReservationsCRUD from "./pages/ReservationCRUD";
import ReviewsCRUD from "./pages/ReviewCRUD";
import UserCRUD from "./pages/UserCRUD"; 
import styles from "./AdminStyles.module.css";

export default function AdminPanel() {
    const navigate = useNavigate(); // Исправлено: инициализируем navigate внутри компонента
    const [activeTab, setActiveTab] = useState("categories");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        
        if (!storedUser) {
            // Если токена/пользователя нет вообще — отправляем на логин
            navigate("/Login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            // Если вошел обычный пользователь, а не админ — тоже выгоняем на логин
            // Измените старое условие проверки в AdminPanel.jsx
            if (user.role_id !== 1) { 
                navigate("/Login");
            } else {
                setIsAdmin(true); 
            }
        } catch (e) {
            navigate("/Login");
        }
    }, [navigate]);

    // Пока идет проверка прав, ничего важного не рендерим
    if (!isAdmin) {
        return <div style={{ color: '#fff', padding: '20px' }}>Проверка прав доступа...</div>;
    }

    return (
        <div className={styles.adminLayout}>
            {/* Боковое меню */}
            <aside className={styles.sidebar}>
                <h3>Панель Админа</h3>
                <ul className={styles.menuList}>
                    <li 
                        className={`${styles.menuItem} ${activeTab === "products" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("products")}
                    >
                        📦 Товары
                    </li>
                    <li 
                        className={`${styles.menuItem} ${activeTab === "categories" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("categories")}
                    >
                        📁 Категории
                    </li>
                    <li 
                        className={`${styles.menuItem} ${activeTab === "users" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        👥 Пользователи
                    </li>
                    <li 
                        className={`${styles.menuItem} ${activeTab === "reservations" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("reservations")}
                    >
                        📅 Бронирование
                    </li>
                    <li 
                        className={`${styles.menuItem} ${activeTab === "reviews" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        ⭐ Отзывы
                    </li>
                </ul>
            </aside>

            {/* Контентная зона */}
            <main className={styles.contentArea}>
                {activeTab === "categories" && <CategoriesCRUD />}
                {activeTab === "products" && <ProductsCRUD />} 
                {activeTab === "users" && <UserCRUD />} 
                {activeTab === "reservations" && <ReservationsCRUD />} 
                {activeTab === "reviews" && <ReviewsCRUD />} 
            </main>
        </div>
    );
}