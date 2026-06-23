import React, { useState, useEffect } from 'react';
import styles from './BookingForm.module.css';

export default function BookingForm() {
    // Список столов, который придет из БД
    const [tables, setTables] = useState([]);
    
    // Данные формы в соответствии с архитектурой БД
    const [formData, setFormData] = useState({
        tableId: '',
        reservationDate: '',
        reservationTime: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    // 1. Загружаем актуальные столы из БД при загрузке компонента
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/tables');
                if (response.ok) {
                    const data = await response.json();
                    setTables(data);
                }
            } catch (err) {
                console.error('Не удалось загрузить столы:', err);
            }
        };
        fetchTables();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. Отправка бронирования на сервер
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Для бронирования стола необходимо авторизоваться');
            }

            const response = await fetch('http://localhost:5000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Передаем токен для определения user_id
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при оформлении брони');
            }

            setMessage({ text: data.message, type: 'success' });
            setFormData({ tableId: '', reservationDate: '', reservationTime: '' }); // Очистка формы

        } catch (err) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="booking" className={styles.blackBackground}>
            <div className={styles.whiteCard}>
                <h2>Забронировать Стол</h2>
                
                {message.text && (
                    <p style={{ 
                        color: message.type === 'success' ? '#2ecc71' : '#e74c3c', 
                        textAlign: 'center', 
                        marginBottom: '15px',
                        fontWeight: 'bold' 
                    }}>
                        {message.text}
                    </p>
                )}

                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    {/* Динамический выбор столика из БД */}
                    <div className={styles.selectWrapper}>
                        <select 
                            name="tableId" 
                            value={formData.tableId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled hidden>Выберите столик</option>
                            {tables.map(table => (
                                <option key={table.id} value={table.id}>
                                    Стол №{table.table_number} ({table.capacity} чел.)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Поле выбора даты */}
                    <input 
                        type="date" 
                        name="reservationDate"
                        value={formData.reservationDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]} // Ограничение: нельзя выбрать прошедшую дату
                        required 
                    />

                    {/* Поле выбора времени */}
                    <input 
                        type="time" 
                        name="reservationTime"
                        value={formData.formData}
                        onChange={handleChange}
                        required 
                    />

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? "Обработка..." : "Подтвердить бронь"}
                    </button>
                </form>
            </div>
        </div>
    );
}
