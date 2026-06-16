import styles from './Header.module.css';
import logo from '../../assets/images/logo.svg';
import shcart from '../../assets/images/Button 5.svg';
import pfp from '../../assets/images/Button 6.svg';

export default function Header(){
    return(
        <header>
            <img src={logo} alt="Logo" className={styles.logo}/>
            <nav>
                <ul>
                    <li><a href="">Главная</a></li>
                    <li><a href="">Забронировать</a></li>
                    <li><a href="">Каталог</a></li>
                    <li><a href=""><img src={shcart} alt="Корзина" /></a></li>
                    <li><a href=""><img src={pfp} alt="Профиль" /></a></li>
                </ul>
            </nav>
        </header>
    )
}