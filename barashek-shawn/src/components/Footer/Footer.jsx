import React from 'react';
import styles from './Footer.module.css';
import Logo from '../../assets/images/logo.svg'; // Путь к вашему логотипу барана

export default function Footer() {
    return (
        <footer className={styles.footerBackground}>
            <div className={styles.footerContent}>
                {/* Левая колонка с логотипом */}
                <div className={styles.logoSection}>
                    <img src={Logo} alt="Логотип Барашек Шон" className={styles.logo} />
                </div>

                {/* Правая часть с четырьмя колонками ссылок */}
                <div className={styles.linksContainer}>
                    <div className={styles.linkColumn}>
                        <h4>Навигация</h4>
                        <a href="#menu">Меню</a>
                        <a href="#about">О нас</a>
                        <a href="#delivery">Доставка</a>
                        <a href="#contacts">Контакты</a>
                    </div>

                    <div className={styles.linkColumn}>
                        <h4>Каталог</h4>
                        <a href="#steaks">Стейки</a>
                        <a href="#burgers">Бургеры</a>
                        <a href="#snacks">Закуски</a>
                        <a href="#drinks">Напитки</a>
                    </div>

                    <div className={styles.linkColumn}>
                        <h4>Услуги</h4>
                        <a href="#booking">Бронь стола</a>
                        <a href="#tastings">Дегустации</a>
                        <a href="#events">Мероприятия</a>
                        <a href="#loyalty">Лояльность</a>
                    </div>

                    <div className={styles.linkColumn}>
                        <h4>Правовая инфо</h4>
                        <a href="#privacy">Политика конфиденциальности</a>
                        <a href="#terms">Условия оферты</a>
                        <a href="#requisites">Реквизиты</a>
                        <a href="#support">Поддержка</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
