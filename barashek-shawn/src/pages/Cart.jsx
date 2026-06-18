import { useState } from "react";
import Header from "../components/Header/Header";
import styles from "./styles/Cart.module.css";

import hinkali from "../assets/images/hinkali.png";
import shashlik from "../assets/images/shashlik.png";

export default function Cart() {
    // 1. Создаем массив товаров в состоянии (state)
    const [cartItems, setCartItems] = useState([
        { id: 1, title: "Хинкали", price: 500, quantity: 2, img: hinkali },
        { id: 2, title: "Шашлык", price: 500, quantity: 2, img: shashlik }
    ]);

    // 2. Функция для изменения количества (+ или -)
    const changeQuantity = (id, delta) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity + delta;
                    // Не позволяем количеству упасть меньше 1
                    return { ...item, quantity: newQuantity < 1 ? 1 : newQuantity };
                }
                return item;
            })
        );
    };

    // 3. Функция для удаления товара из корзины
    const deleteItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // 4. Вычисляем общие показатели на основе текущего состояния
    const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = 0; // Сюда можно будет подключить логику промокода

    return (
        <div>
            <Header />
            <div className={styles['order-container']}>

                {/* Левая часть: Товары и Итог */}
                <div className={styles['cart-section']}>
                    <div className={styles['cart-items']}>
                        
                        {/* Рендерим товары динамически через .map() */}
                        {cartItems.map(item => (
                            <div key={item.id} className={styles['cart-item']}>
                                <img src={item.img} alt={item.title} className={styles['item-img']}/>
                                <div className={styles['item-details']}>
                                    <div className={styles['item-title']}>{item.title}</div>
                                    <div className={styles['item-price']}>{item.price}₽</div>
                                    <div className={styles['quantity-label']}>Порций:</div>
                                    <div className={styles['quantity-controls']}>
                                        <button 
                                            className={styles['btn-deletee']}
                                            onClick={() => deleteItem(item.id)}
                                        >
                                            🗑️
                                        </button>
                                        <button 
                                            className={styles['btn-minus']}
                                            onClick={() => changeQuantity(item.id, -1)}
                                        >
                                            —
                                        </button>
                                        <span className={styles['quantity-value']}>{item.quantity}</span>
                                        <button 
                                            className={styles['btn-plus']}
                                            onClick={() => changeQuantity(item.id, 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cartItems.length === 0 && (
                            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                                Корзина пуста
                            </div>
                        )}

                    </div>

                    {/* Итог */}
                    <div className={styles['summary-block']}>
                        <div className={styles['summary-row']}>
                            <span>Блюда ({totalItemsCount})</span>
                            <span>{totalPrice}₽</span>
                        </div>
                        <div className={styles['summary-row']}>
                            <span>Скидка</span>
                            <span>{discount}₽</span>
                        </div>
                        <div className={`${styles['summary-row']} ${styles.total}`}>
                            <span>Итого</span>
                            <span>{totalPrice - discount}₽</span>
                        </div>
                    </div>
                </div>

                {/* Правая часть: Форма заказа */}
                <form className={styles['form-section']} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles['form-group']}>
                        <label>Имя</label>
                        <input type="text" placeholder="Введите имя" />
                    </div>

                    <div className={styles['form-group']}>
                        <label>Фамилия</label>
                        <input type="text" placeholder="Введите фамилию" />
                    </div>

                    <div className={styles['form-group']}>
                        <label>Телефон</label>
                        <input type="tel" placeholder="Введите номер телефона" />
                    </div>

                    <div className={styles['form-group']}>
                        <label>Адрес</label>
                        <input type="text" placeholder="Введите адрес доставки" />
                    </div>

                    <div className={styles['form-group']}>
                        <label>Промокод</label>
                        <input type="text" placeholder="Введите промокод" />
                    </div>

                    <button type="submit" className={styles['btn-submit']}>Заказать</button>
                </form>
            </div>
        </div>
    );
}
