import backgroundLogo from './assets/icons/BackgroundLogo.svg';
import './App.css';

import { Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import Catalog from './pages/Catalog';
import DishPage from './pages/DishPage';
import Login from './pages/Login';
import PaymentMethod from './pages/PaymentMethod';
import Cart from './pages/Cart';

function App() {
  return (
    <div className="App">
      {/* 1. Добавляем сам тег картинки на страницу */}
      <img 
        src={backgroundLogo} 
        alt="Background Logo" 
        className="backgroundLogo" 
      />

      {/* 2. Оборачиваем роутер в контейнер для управления слоями */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<MainPage/>}/>
          <Route path="/DishPage" element={<DishPage/>}/>
          <Route path="/Catalog" element={<Catalog/>}/>
          <Route path="/Login" element={<Login/>}/>
          <Route path="/PaymentMethod" element={<PaymentMethod/>}/>
          <Route path="/Cart" element={<Cart/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;
