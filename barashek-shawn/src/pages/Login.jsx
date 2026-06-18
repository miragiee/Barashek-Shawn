import { Link } from "react-router-dom";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer"

import styles from "./styles/Login.module.css";
export default function Login () {
    return (
        <div className={styles.LoginPage}>
            <Header/>
            <main className={styles.Container}>
                <h1 className={styles.Title}>Вход</h1>
                <div className={styles.Inputs}>
                    <input placeholder="Почта" type="text" className={styles.InputBar}/>
                    <input placeholder="Пароль" type="text" className={styles.InputBar}/>
                    <button type="submit" className={styles.EnterButton}>Войти</button>
                </div>

                <div className={styles.UsefullLinks}>
                    <Link to={"/Register"} className={styles.NormalLink}>Зарегистрироваться</Link>
                    <Link className={styles.AccentLink}>Забыл пароль</Link>
                </div>
            </main>
            <Footer/>

        </div>
    )
}