import styles from './Reviews.module.css'

export default function Reviews(){
    return(
        <div className={styles.Reviews}>
            <h2 className={styles.blockHeader}>Отзывы</h2>
            <div className={styles.ReviewContainer}>
                <div className={styles.PersonalInfo}>
                    <h3>Name</h3>
                    <img src="" alt="Avatar"/>
                </div>
                <div className={styles.ReviewContent}>
                    <div className={styles.Stars}>
                        <img src="" alt="Rating" />
                    </div>
                    <div className={styles.ReviewText}>
                        <p>text</p>
                    </div>
                    <div className={styles.PhotoBlock}>
                        <img src="" alt="Картинка" />
                    </div>
                </div>
            </div>
        </div>
    );
}