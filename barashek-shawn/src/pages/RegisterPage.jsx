import styles from "./styles/RegisterPage.module.css";
import { Link } from "react-router-dom";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import phone_icon from "../assets/icons/phone_icon.svg";
import email_icon from "../assets/icons/email_icon.svg";

export default function RegisterPage(){
    return(

        <div className={styles.RegisterPage}>
            <Header/>

            <main className={styles.Container}>
                <h2 className={styles.PageTitle}>
                    Регистрация
                </h2>
                <div className={styles.RegisterMethod}>
                    <button className={styles.ActiveButton} id="email"><img src={email_icon} alt="Через почту" /></button>
                    <button className={styles.NonActiveButton} id="phone"><img src={phone_icon} alt="По телефону" /></button>
                </div>
                <div className={styles.Inputs}>
                    <input type="text" placeholder="Введите почту" className={styles.InputBar}/>
                    <input type="text" placeholder="Введите почту" className={styles.InputBar}/>
                    <input type="text" placeholder="Введите почту" className={styles.InputBar}/>
                    <input type="submit" className={styles.SubmitButton}/>
                </div>
                <div className={styles.Auth}>
                    <p className={styles.SmallText}>Уже есть аккаунт?</p>
                    <Link to="/Login" className={styles.AuthLink}>Войти</Link>
                </div>
            </main>

            <Footer/>
        </div>
    );
}