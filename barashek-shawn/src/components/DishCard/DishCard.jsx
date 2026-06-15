import styles from "./DishCard.module.css";
import dishPlaceholder from '../../assets/images/dish_placeholder.png';

export default function DishCard({ name, price, imageUrl }) {
    return (
        <div className={styles.CardContainer}>
            {/* Убрали "http://localhost:5000" передimageUrl */}
            <img 
                src={imageUrl ? imageUrl : dishPlaceholder} 
                alt={name || "Блюдо"} 
                className={styles.DishPhoto}
                onError={(e) => { 
                    // Если вдруг картинка не найдется, сработает заглушка
                    e.target.src = dishPlaceholder; 
                }}
            />
            <h3 className={styles.DishName}>{name || "Название блюда"}</h3>
            <div className={styles.DishPrice}>{price ? `${Number(price).toLocaleString()} ₽` : "Цена"}</div>
            <button className={styles.BuyButton}>Купить</button>
        </div>
    );
}
