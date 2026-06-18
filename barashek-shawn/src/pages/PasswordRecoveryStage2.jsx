import styles from "./styles/Recovery.module.css"
import {Link} from "react-router-dom"

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function PasswordRecoveryStage2(){
    return(
        <div className={styles.RecoveryPage}>
            <Header/>

            <main className={styles.Container}>
                <h2 className={styles.PageTitle}>Восстановить пароль</h2>

                <div className={styles.Inputs}>
                    <input type="text" placeholder="Введите новый пароль" className={styles.InputBar}/>
                    <input type="text" placeholder="Повторите новый пароль" className={styles.InputBar}/>
                    <input type="submit" className={styles.SubmitButton}/>
                    <Link to={"/Login"} className={styles.AuthLink}>Отмена</Link>
                </div>
                
            </main>

            <Footer/>
        </div>
    );
}