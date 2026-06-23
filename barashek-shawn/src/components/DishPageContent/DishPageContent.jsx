import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './DishPageContent.module.css';
import placeHolder from '../../assets/images/dish_placeholder.png'; 

export default function DishPageContent(){
    const { id } = useParams(); 
    const [dish, setDish] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDishData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:5000/api/dishes/${id}`); 
                
                if (!response.ok) {
                    throw new Error('Блюдо не найдено или произошла ошибка сервера');
                }
                
                const data = await response.json();
                setDish(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchDishData();
    }, [id]);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Загрузка...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '100px', color: 'red' }}>{error}</div>;
    if (!dish) return <div style={{ textAlign: 'center', padding: '100px', color: '#fff' }}>Блюдо не найдено</div>;

    return(
        <div className={styles.DishPageMain}>
            <div className={styles.NavigationBlock}>
                <Link to="/Catalog" className={styles.GoBack}>
                    Назад в каталог
                </Link>

                <h2>
                    {dish.name}
                </h2>
            </div>

            <div className={styles.DishCard}>
                <img 
                    src={dish.image_url ? dish.image_url : placeHolder} 
                    alt={dish.name} 
                    onError={(e) => { e.target.src = placeHolder; }}
                />
                <div className="DishDescription">
                    {/* Старые поля заменены на одно общее поле description из вашей БД */}
                    <div className={styles.DescriptionText}>
                        {dish.description || 'Описание блюда временно отсутствует.'}
                    </div>
                </div>
            </div>

            <div className={styles.AddToCartBlock}>
                <div className={styles.Price}>
                    {dish.price ? `${Number(dish.price).toLocaleString()} ₽` : 'Цена по запросу'}
                </div>
                <button className={styles.AddToCartBtn}>
                    В корзину
                </button>
            </div>
        </div>
    );
}
