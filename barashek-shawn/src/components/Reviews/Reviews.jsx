import styles from './Reviews.module.css'
import pfp from '../../assets/icons/avatar_palceholder.svg'
import reviewStar from '../../assets/icons/review_star.svg'
import kebab1 from '../../assets/images/kebab_placeholder1.png'
import kebab2 from '../../assets/images/kebab_placeholder2.png'
import kebab3 from '../../assets/images/kebab_placeholder3.png'
import arrowLeft from '../../assets/icons/button_arrow_left.svg'
import arrowRight from '../../assets/icons/button_arrow_right.svg'

export default function Reviews(){
    return(
        <div className={styles.Reviews}>
            <h2 className={styles.blockHeader}>Отзывы</h2>
            <div className={styles.ReviewContainer}>
                <button className={styles.MoveLeft}>
                    <img src={arrowLeft} alt="Предыдущий" />
                </button>
                <div className={styles.ReviewCard}>
                    <div className={styles.PersonalInfo}>
                        <h3>Name</h3>
                        <img src={pfp} alt="Avatar"/>
                    </div>
                    <div className={styles.ReviewContent}>
                        <div className={styles.Stars}>
                            <img src={reviewStar} alt="Rating" />
                            <img src={reviewStar} alt="Rating" />
                            <img src={reviewStar} alt="Rating" />
                            <img src={reviewStar} alt="Rating" />
                            <img src={reviewStar} alt="Rating" />
                        </div>
                        <div className={styles.WhatUserSays}>
                            <div className={styles.ReviewText}>
                                <p>
                                    Вкусный шашлык. Очень сочный и мягкий. Не пересолен.
                                    Картофель на гарнир хрустящий снаружи и мягкий внутри.
                                </p>
                            </div>
                            <div className={styles.PhotoBlock}>
                                <img src={kebab1} alt="Картинка" />
                                <img src={kebab2} alt="Картинка" />
                                <img src={kebab3} alt="Картинка" />
                            </div>
                        </div>
                    </div>
                </div>
                <button className={styles.MoveRight}>
                    <img src={arrowRight} alt="Следующий" />
                </button>
            </div>
        </div>
    );
}