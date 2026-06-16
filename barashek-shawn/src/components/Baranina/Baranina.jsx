import { useState, useEffect } from 'react';
import styles from './Baranina.module.css';
import DishCard from '../DishCard/DishCard';
import arrowLeft from '../../assets/images/button_arrow_left.svg';
import arrowRight from '../../assets/images/button_arrow_right.svg';

export default function Baranina() {
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
        return <div className={styles.BaraninaBlock}><h2>Загрузка...</h2></div>;
    }

    return (
        <div className={styles.BaraninaBlock}>
            <h2>Баранина</h2>
            <div className={styles.BlockContent}>
                <button className={styles.MoveLeft}>
                    <img src={arrowLeft} alt="Предыдущий" />
                </button>
                <div className={styles.CardBlock}>
                    {dishes.map((dish) => (
                        <DishCard 
                            key={dish.id} 
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
