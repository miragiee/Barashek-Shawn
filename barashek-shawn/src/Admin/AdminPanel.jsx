import React, { useState } from "react";
import CategoriesCRUD from "./pages/CategoriesCRUD";
import ProductsCRUD from "./pages/ProductCRUD"; // 1. Импортируем новый компонент товаров
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
                        className={`${styles.menuItem} ${activeTab === "categories" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("categories")}
                    >
                        📁 Категории
                    </li>
                    <li 
                        className={`${styles.menuItem} ${activeTab === "products" ? styles.menuItemActive : ""}`}
                        onClick={() => setActiveTab("products")}
                    >
                        📦 Товары
                    </li>
                </ul>
            </aside>

            {/* Контентная зона */}
            <main className={styles.contentArea}>
                {activeTab === "categories" && <CategoriesCRUD />}
                {/* 2. Заменяем текстовую заглушку на сам компонент */}
                {activeTab === "products" && <ProductsCRUD />} 
            </main>
        </div>
    );
}
