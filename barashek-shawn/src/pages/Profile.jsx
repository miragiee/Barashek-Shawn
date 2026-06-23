import React, { useState, useEffect } from 'react';
import styles from './styles/Profile.module.css';

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function Profile() {
  // Состояние формы (изначально пустое, пока идет запрос к БД)
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    phone: ''
  });

  // Отдельное состояние для плейсхолдеров (чтобы не оставалось пустоты, если всё стереть)
  const [placeholders, setPlaceholders] = useState({
    first_name: 'Загрузка...',
    email: 'Загрузка...',
    phone: 'Загрузка...'
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 1. Загрузка данных из БД сразу при открытии страницы
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // ЗАПОЛНЯЕМ ИНПУТЫ И ПЛЕЙСХОЛДЕРЫ ДАННЫМИ ИЗ БД СРАЗУ
          const userData = {
            first_name: data.first_name || '',
            email: data.email || '',
            phone: data.phone || ''
          };
          
          setFormData(userData);
          setPlaceholders({
            first_name: data.first_name || 'Имя не указано',
            email: data.email || 'Email не указан',
            phone: data.phone || 'Телефон не указан'
          });
        }
      } catch (err) {
        console.error('Ошибка при загрузке профиля:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 2. Отправка измененных данных
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setMessage({ text: 'Вы не авторизованы', type: 'error' });
        setIsLoading(false);
        return;
      }

      // Если пользователь стёр поле до пустоты, подставляем значение из плейсхолдера
      const dataToSend = {
        first_name: formData.first_name.trim() !== '' ? formData.first_name : placeholders.first_name,
        email: formData.email.trim() !== '' ? formData.email : placeholders.email,
        phone: formData.phone.trim() !== '' ? formData.phone : placeholders.phone
      };

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось обновить данные');
      }

      setMessage({ text: data.message, type: 'success' });
      
      // Обновляем инпуты и плейсхолдеры новыми данными
      setFormData(dataToSend);
      setPlaceholders(dataToSend);

    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.ProfilePage}>
        <Header/>

        <main className={styles.main}>
            <h1 className={styles.h1}>Ваш Профиль</h1>
            <h2 className={styles.h2}>Изменить информацию</h2>

            {message.text && (
              <p style={{ color: message.type === 'success' ? 'green' : 'red', textAlign: 'center' }}>
                {message.text}
              </p>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Изменить имя</label>
                <input 
                  type="text" 
                  name="first_name"
                  value={formData.first_name} // Отображает актуальное имя из БД
                  onChange={handleChange}
                  placeholder={placeholders.first_name} 
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Почта</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} // Отображает актуальный email из БД
                  onChange={handleChange}
                  placeholder={placeholders.email} 
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Номер телефона</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone} // Отображает актуальный телефон из БД
                  onChange={handleChange}
                  placeholder={placeholders.phone} 
                  className={styles.input} 
                />
              </div>

              <button type="submit" className={styles.button} disabled={isLoading}>
                {isLoading ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </form>
        </main>

        <Footer/>
    </div>
  );
}
