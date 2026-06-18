import React from 'react';
import styles from './styles/Profile.module.css';

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function Profile() {
  return (
    <div className={styles.ProfilePage}>
        <Header/>

        <main className={styles.main}>
            <h1 className={styles.h1}>Ваш Профиль</h1>
            <h2 className={styles.h2}>Изменить информацию</h2>

            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Изменить имя</label>
                <input 
                  type="text" 
                  placeholder="Иван" 
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Изменить фамилию</label>
                <input 
                  type="text" 
                  placeholder="Иванов" 
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Почта</label>
                <input 
                  type="email" 
                  placeholder="mail@example.com" 
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Номер телефона</label>
                <input 
                  type="tel" 
                  placeholder="88005553535" 
                  className={styles.input} 
                />
              </div>

              <button type="button" className={styles.button}>
                Сохранить изменения
              </button>
            </form>
        </main>

        <Footer/>
    </div>
  );
}
