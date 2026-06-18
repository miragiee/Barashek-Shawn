import styles from './Hero.module.css'

import { HashLink } from 'react-router-hash-link';
import heroImg from '../../assets/images/HeroSteak.png'

export default function Hero(){
    return(
        <div className={styles.hero}>
            <img src={heroImg} alt="Стейк" className={styles.heroImg}/>
            <div className={styles.heroFunc}>
                <h1>Барашек Шон</h1>
                <div>
                    <p>Лучший мясной ресторан в Санкт-Петербурге</p>
                    <p>Ул. Курляндская, 35</p>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.abutton}><HashLink smooth to="/#booking">Забронировать стол</HashLink></div>
                    <div className={styles.bbutton}><HashLink to="/Catalog">Заказать доставку</HashLink></div>
                </div>
            </div>
        </div>
    )
}