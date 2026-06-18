import React from "react";
import styles from "./styles/PaymentSuccess.module.css";

import payment_success from "../assets/icons/Success.svg";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function PaymentSuccess(){
    return(
        <div className={styles.PaymentSuccess}>
            <Header/>

            <main className={styles.Container}>
                <img src={payment_success} alt="Успешно" className={styles.SuccessImage}/>
                <p className={styles.SuccessText}>Оплата прошла успешно!</p>
            </main>

            <Footer/>
        </div>
    );
}