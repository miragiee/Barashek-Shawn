import { useState, useEffect } from 'react';
import styles from './Recommendations.module.css';
import DishCard from '../DishCard/DishCard';
import arrowLeft from '../../assets/icons/button_arrow_left.svg';
import arrowRight from '../../assets/icons/button_arrow_right.svg';

export default function Recommendations() {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then((response) => response.json())
            .then((data) => {
                // Выводим в консоль ТОЧНЫЙ тип и структуру данных
                console.log("Что пришло с сервера:", data);
                
                // Проверяем, действительно ли это массив
                if (Array.isArray(data)) {
                    setDishes(data.slice(0, 4));
                } else {
                    console.error("Сервер вернул объект вместо массива! Возможно, там ошибка.");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке рекомендаций:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className={styles.RecommendationBlock}><h2>Загрузка...</h2></div>;
    }

    return (
        <div className={styles.RecommendationBlock}>
            <h2>Рекомендуемые блюда</h2>
            <div className={styles.BlockContent}>
                <button className={styles.MoveLeft}>
                    <img src={arrowLeft} alt="Предыдущий" />
                </button>
                <div className={styles.CardBlock}>
                    {dishes.map((dish) => (
                        <DishCard 
                            key={dish.id || dish.product_id} // Безопасный ключ для React
                            id={dish.id || dish.product_id}   // ИСПРАВЛЕНО: Теперь ID передается внутрь карточки!
                            name={dish.name} 
                            price={dish.price} 
                            imageUrl={dish.image_url} 
                        />
                    ))}
                </div>

                <button className={styles.MoveRight}>
                    <img src={arrowRight} alt="Следующий" />
                </button>
            </div>
        </div>
    );
}
