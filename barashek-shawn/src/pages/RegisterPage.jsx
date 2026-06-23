import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/RegisterPage.module.css";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import phone_icon from "../assets/icons/phone_icon.svg";
import email_icon from "../assets/icons/email_icon.svg";

export default function RegisterPage() {
    // Состояния для хранения данных формы
    const [formData, setFormData] = useState({
        first_name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // Состояния для ошибок и успешного ответа
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Обработчик изменения полей ввода
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Проверка совпадения паролей на клиенте
        if (formData.password !== formData.confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", { // Замените порт на ваш актуальный
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Что-то пошло не так");
            }

            setSuccess(data.message);
            
            // Перенаправление на страницу логина через 2 секунды после успеха
            setTimeout(() => {
                navigate("/Login");
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.RegisterPage}>
            <Header />

            <main className={styles.Container}>
                <h2 className={styles.PageTitle}>Регистрация</h2>
                
                <div className={styles.RegisterMethod}>
                    <button className={styles.ActiveButton} id="email">
                        <img src={email_icon} alt="Через почту" />
                    </button>
                    <button className={styles.NonActiveButton} id="phone">
                        <img src={phone_icon} alt="По телефону" />
                    </button>
                </div>

                {/* Вывод сообщений об ошибках или успехе */}
                {error && <p className={styles.ErrorMessage} style={{ color: "red" }}>{error}</p>}
                {success && <p className={styles.SuccessMessage} style={{ color: "green" }}>{success}</p>}

                {/* Обернули инпуты в тег form для корректной отправки */}
                <form onSubmit={handleSubmit} className={styles.Inputs}>
                    <input 
                        type="text" 
                        name="first_name"
                        placeholder="Ваше имя" 
                        className={styles.InputBar}
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        type="tel" 
                        name="phone"
                        placeholder="Номер телефона" 
                        className={styles.InputBar}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Введите почту" 
                        className={styles.InputBar}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Введите пароль" 
                        className={styles.InputBar}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder="Повторите пароль" 
                        className={styles.InputBar}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button 
                        type="submit" 
                        className={styles.SubmitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </button>
                </form>

                <div className={styles.Auth}>
                    <p className={styles.SmallText}>Уже есть аккаунт?</p>
                    <Link to="/Login" className={styles.AuthLink}>Войти</Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
