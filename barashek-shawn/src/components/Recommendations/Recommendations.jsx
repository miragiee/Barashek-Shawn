import styles from './Recommendations.module.css';
import '../DishCard/DishCard';
import DishCard from '../DishCard/DishCard';

export default function Recommendations(){
    return(
        <div className={styles.RecommendationBlock}>
            <h2>Рекомендуемые блюда</h2>
            <div className={styles.BlockContent}>
                <button className={styles.MoveLeft}>Влево</button>
            <div className={styles.CardBlock}>
                <DishCard/>
                <DishCard/>
                <DishCard/>
                <DishCard/>
            </div>
            <button className={styles.MoveRight}>Вправо</button>
            </div>
        </div>
    );
}