import React, { useState } from 'react';
import styles from './BookingForm.module.css';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        tableId: '',
        firstName: '',
        lastName: '',
        phone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Данные для отправки в БД:', formData);
        // Здесь будет fetch-запрос к бэкенду
    };

    return (
        <div id="booking" className={styles.blackBackground}>
            <div className={styles.whiteCard}>
                <h2>Забронировать Стол</h2>
                
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.selectWrapper}>
                        <select 
                            name="tableId" 
                            value={formData.tableId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled hidden>Выберите столик</option>
                            <option value="1">Стол №1 (Основной зал, 2 чел.)</option>
                            <option value="2">Стол №2 (Основной зал, 4 чел.)</option>
                            <option value="3">Стол №3 (Веранда, 4 чел.)</option>
                            <option value="4">Стол №4 (VIP-комната, 6 чел.)</option>
                        </select>
                    </div>

                    <input 
                        type="text" 
                        name="firstName"
                        placeholder="Введите ваше имя здесь" 
                        value={formData.firstName}
                        onChange={handleChange}
                        required 
                    />

                    <input 
                        type="text" 
                        name="lastName"
                        placeholder="Введите вашу фамилию здесь" 
                        value={formData.lastName}
                        onChange={handleChange}
                        required 
                    />

                    <input 
                        type="tel" 
                        name="phone"
                        placeholder="Введите ваш номер телефона" 
                        value={formData.phone}
                        onChange={handleChange}
                        required 
                    />

                    <button type="submit" className={styles.submitButton}>
                        Подтвердить бронь
                    </button>
                </form>
            </div>
        </div>
    );
}
