import styles from './Hero.module.css'
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
                <div>
                    <a href="">Забронировать стол</a>
                    <a href="">Заказать доставку</a>
                </div>
            </div>
        </div>
    )
}