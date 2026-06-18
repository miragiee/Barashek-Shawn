import React, { useState } from "react";
import CategoriesCRUD from "./pages/CategoriesCRUD";
import ProductsCRUD from "./pages/ProductCRUD";
import ReservationsCRUD from "./pages/ReservationCRUD";
import ReviewsCRUD from "./pages/ReviewCRUD";
import styles from "./AdminStyles.module.css";

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState("categories");

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
                {activeTab === "reservations" && <ReservationsCRUD />} 
                {activeTab === "reviews" && <ReviewsCRUD />} 
            </main>
        </div>
    );
}
