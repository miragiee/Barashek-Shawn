import styles from './Header.module.css';
import logo from '../../assets/icons/logo.svg';
import shcart from '../../assets/icons/Button 5.svg';
import pfp from '../../assets/icons/Button 6.svg';
import { Link } from 'react-router-dom';



export default function Header(){
    return(
        <header>
            <Link to="/"><img src={logo} alt="Logo" className={styles.logo}/></Link>
            <nav>
                <ul>
                    <li><Link to="/">Главная</Link></li>
                    <li><Link href="">Забронировать</Link></li>
                    <li><Link to="/Catalog">Каталог</Link></li>
                    <li><Link to="/Cart"><img src={shcart} alt="Корзина" /></Link></li>
                    <li><Link to="/Login"><img src={pfp} alt="Профиль" /></Link></li>
                </ul>
            </nav>
        </header>
    )
}