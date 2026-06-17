import Header from "../components/Header/Header";
import styles from "./Cart.module.css";

import hinkali from "../assets/images/hinkali.png";
import shashlik from "../assets/images/shashlik.png";

export default function Cart() {
    return (
        <div>
            <Header />
            <div className={styles['order-container']}>

                {/* <!-- Левая часть: Товары и Итог --> */}
                <div className={styles['cart-section']}>
                    <div className={styles['cart-items']}>

                        {/* <!-- Хинкали --> */}
                        <div className={styles['cart-item']}>
                            <img src={hinkali} alt="Хинкали" className={styles['item-img']}/>
                            <div className={styles['item-details']}>
                                <div className={styles['item-title']}>Хинкали</div>
                                <div className={styles['item-price']}>500₽</div>
                                <div className={styles['quantity-label']}>Порций:</div>
                                <div className={styles['quantity-controls']}>
                                    <button className={styles['btn-deletee']}>🗑️</button>
                                    <button className={styles['btn-minus']}>—</button>
                                    <span className={styles['quantity-value']}>2</span>
                                    <button className={styles['btn-plus']}>+</button>
                                </div>
                            </div>
                        </div>

                        {/* <!-- Шашлык --> */}
                        <div className={styles['cart-item']}>
                            <img src={shashlik} alt="Шашлык" className={styles['item-img']} />
                            <div className={styles['item-details']}>
                                <div className={styles['item-title']}>Шашлык</div>
                                <div className={styles['item-price']}>500₽</div>
                                <div className={styles['quantity-label']}>Порций:</div>
                                <div className={styles['quantity-controls']}>
                                    <button className={styles['btn-deletee']}>🗑️</button>
                                    <button className={styles['btn-minus']}>—</button>
                                    <span className={styles['quantity-value']}>2</span>
                                    <button className={styles['btn-plus']}>+</button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* <!-- Итог --> */}
                    <div className={styles['summary-block']}>
                        <div className={styles['summary-row']}>
                            <span>Блюда (4)</span>
                            <span>2000₽</span>
                        </div>
                        <div className={styles['summary-row']}>
                            <span>Скидка</span>
                            <span>0₽</span>
                        </div>
                        {/* Исправлен ошибочный синтаксис составного класса */}
                        <div className={`${styles['summary-row']} ${styles.total}`}>
                            <span>Итого</span>
                            <span>2000₽</span>
                        </div>
                    </div>
                </div>

                {/* <!-- Правая часть: Форма заказа --> */}
                {/* Классы из CSS-модуля привязаны через styles */}
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
                        <input type="text" placeholder="Введите адрес доставки" />
                    </div>

                    <button type="submit" className={styles['btn-submit']}>Заказать</button>
                </form>
            </div>
        </div>
    )
}
