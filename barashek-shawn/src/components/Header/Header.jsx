import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Импортируем HashLink для работы с якорными ссылками
import { HashLink } from 'react-router-hash-link';
import styles from './Header.module.css';
import logo from '../../assets/icons/logo.svg';
import shcart from '../../assets/icons/Button 5.svg';
import pfp from '../../assets/icons/Button 6.svg';

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Проверяем наличие пользователя в хранилище при монтировании компонента
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Ошибка парсинга данных пользователя:", e);
            }
        }
    }, []);

    // Функция для выхода из аккаунта
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/Login");
    };

    return (
        <header className={styles.header}>
            <Link to="/"><img src={logo} alt="Logo" className={styles.logo}/></Link>
            <nav>
                <ul className={styles.navList}>
                    <li><Link to="/">Главная</Link></li>
                    
                    {/* Используем HashLink с атрибутом smooth для плавной анимации скролла */}
                    <li>
                        <HashLink smooth to="/#booking">Забронировать</HashLink>
                    </li>
                    
                    <li><Link to="/Catalog">Каталог</Link></li>
                    <li>
                        <Link to="/Cart">
                            <img src={shcart} alt="Корзина" />
                        </Link>
                    </li>
                    
                    {/* Динамический блок авторизации */}
                    {user ? (
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link to="/Profile" title={`Личный кабинет: ${user.first_name}`}>
                                <img src={pfp} alt="Профиль" />
                            </Link>
                            <button 
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: '1px solid #3a3a3a',
                                    color: '#aaaaaa',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.target.style.color = '#ffffff'; e.target.style.borderColor = '#dc3545'; }}
                                onMouseLeave={(e) => { e.target.style.color = '#aaaaaa'; e.target.style.borderColor = '#3a3a3a'; }}
                            >
                                Выйти
                            </button>
                        </li>
                    ) : (
                        <li>
                            <Link to="/Login">
                                <img src={pfp} alt="Профиль" />
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
}