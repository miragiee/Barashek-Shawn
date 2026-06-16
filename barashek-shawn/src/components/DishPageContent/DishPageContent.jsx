import styles from './DishPageContent.module.css`'
import placeHolder from '../../assets/images/kebab_placeholder1.png'

export default function DishPageContent(){
    return(
        <div className={styles.DishPageMain}>
            <div className={styles.NavigationBlock}>
                <a href="">
                    <img src="" alt="" />
                </a>

                <h2>
                    Dish Name
                </h2>
            </div>

            <div className={styles.DishCard}>
                <img src={placeHolder} alt="Картинка Блюда" />
                <div className="DishDescription">
                    <div className={styles.Contains}>Состав:</div>
                    <div className={styles.Doneness}>Прожарка:</div>
                    <div className={styles.Weight}>Вес порции</div>
                </div>
            </div>

            <div className={styles.AddToCartBlock}>
                <div className={styles.Price}>
                    Price, ₽
                </div>
                <button className={styles.AddToCartBtn}>
                    В корзину
                </button>
            </div>
        </div>
    );
}