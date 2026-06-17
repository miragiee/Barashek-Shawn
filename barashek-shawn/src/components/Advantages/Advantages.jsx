import styles from './Advantages.module.css';
import medal from '../../assets/icons/ri_medal-fill.svg';
import target from '../../assets/icons/mingcute_target-line.svg';
import money from '../../assets/icons/tabler_moneybag.svg';

export default function Advantages(){
    return(
        <div className={styles.advantages}>
            <h2>Наши преимущества</h2>
            <div className={styles.blockContent}>
                <div className={styles.advantageCard}>
                    <div className={styles.cardHeader}>
                        <img src={medal} alt="Качество" />
                        <h3>Качество</h3>
                    </div>
                    <p>
                        Блюда только из отборных продуктов — насыщенный вкус и безупречная подача.
                    </p>
                </div>
                <div className={styles.advantageCard}>
                    <div className={styles.cardHeader}>
                        <img src={target} alt="Стабильность" />
                        <h3>Стабильность</h3>
                    </div>
                    <p>
                        Неизменно высокое качество: любимый стейк всегда идеален.
                    </p>
                </div>
                <div className={styles.advantageCard}>
                    <div className={styles.cardHeader}>
                        <img src={money} alt="Доступность" />
                        <h3>Доступность</h3>
                    </div>
                    <p>
                        Щедрые порции и честные цены без ущерба для бюджета.
                    </p>
                </div>
            </div>
        
        </div>
    );
}