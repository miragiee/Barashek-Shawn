import styles from "./DishCard.module.css"

export default function DishCard(){
    return(
        <div className={styles.CardContainer}>
            <img src="" alt="Фото блюда" className={styles.DishPhoto}/>
            <h3 className={styles.DishName}>Название блюда</h3>
            <div className={styles.DishPrice}>Цена</div>
            <button className={styles.BuyButton}>Купить</button>
        </div>
    );
}