import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import styles from "./styles/Login.module.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("Пожалуйста, заполните все поля");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Произошла ошибка при входе");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // ПРОВЕРКА НА АДМИНА:
            // Если email совпадает с админским, перенаправляем в админку
            if (data.user.email === "json@yandex.ru") {
                navigate("/AdminPanel");
            } else {
                navigate("/"); 
            }
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.LoginPage}>
            <Header />
            <main className={styles.Container}>
                <h1 className={styles.Title}>Вход</h1>
                
                <form onSubmit={handleSubmit} className={styles.Inputs}>
                    {error && (
                        <div style={{
                            color: "#dc3545",
                            backgroundColor: "rgba(220, 53, 69, 0.1)",
                            padding: "10px",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            textAlign: "center",
                            width: "100%",
                            boxSizing: "border-box",
                            border: "1px solid #dc3545"
                        }}>
                            {error}
                        </div>
                    )}

                    <input 
                        placeholder="Почта" 
                        type="email" 
                        className={styles.InputBar}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        placeholder="Пароль" 
                        type="password" 
                        className={styles.InputBar}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    <button 
                        type="submit" 
                        className={styles.EnterButton}
                        disabled={isLoading}
                    >
                        {isLoading ? "Вход..." : "Войти"}
                    </button>
                </form>

                <div className={styles.UsefullLinks}>
                    <Link to={"/Register"} className={styles.NormalLink}>Зарегистрироваться</Link>
                    <Link to={"/PasswordRecoveryStage1"} className={styles.AccentLink}>Забыл пароль</Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}