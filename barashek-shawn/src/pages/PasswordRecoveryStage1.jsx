import styles from "./styles/Recovery.module.css";
import { Link } from "react-router-dom";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import phone_icon from "../assets/icons/phone_icon.svg";
import email_icon from "../assets/icons/email_icon.svg";

export default function PasswordRecoveryStage1(){

    return(
        <div className={styles.RecoveryPage}>
            <Header/>

            <main className={styles.Container}>

                <h2 className={styles.PageTitle}>
                    Восстановить пароль
                </h2>

                <div className={styles.RecoveryMethod}>
                    <button className={styles.ActiveButton} id="email"><img src={email_icon} alt="Через почту" /></button>
                    <button className={styles.NonActiveButton} id="phone"><img src={phone_icon} alt="По телефону" /></button>
                </div>

                <div className={styles.Inputs}>
                    <input type="text" placeholder="Введите почту" className={styles.InputBar}/>
                    <p>
                        Отправим вам ссылку для восстановления 
                        пароля на почту
                    </p>
                    
                    <input type="submit" className={styles.SubmitButton}/>
                </div>

                <Link to="/Login" className={styles.AuthLink}>Отмена</Link>

            </main>

            <Footer/>
        </div>
    );

}