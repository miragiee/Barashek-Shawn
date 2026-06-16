import { Link } from 'react-router-dom';
import styles from "./DishCard.module.css";
import dishPlaceholder from '../../assets/images/dish_placeholder.png';

export default function DishCard({ id, name, price, imageUrl }) {
    return (
        <Link to="/DishPage" className={styles.CardContainer}>
            <img 
                src={imageUrl ? imageUrl : dishPlaceholder} 
                alt={name || "Блюдо"} 
                className={styles.DishPhoto}
                onError={(e) => { 
                    e.target.src = dishPlaceholder; 
                }}
            />
            <h3 className={styles.DishName}>{name || "Название блюда"}</h3>
            <div className={styles.DishPrice}>{price ? `${Number(price).toLocaleString()} ₽` : "Цена"}</div>
            <button className={styles.BuyButton}>Купить</button>
        </Link>
    );
}
