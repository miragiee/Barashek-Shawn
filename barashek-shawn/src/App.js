import logo from './assets/icons/logo.svg';
import backgroundLogo from './assets/icons/BackgroundLogo.svg';
import './App.css';

import { Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import Catalog from './pages/Catalog';
import DishPage from './pages/DishPage';
import Login from './pages/Login';
import PaymentMethod from './pages/PaymentMethod';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/DishPage" element={<DishPage/>}/>
        <Route path="/Catalog" element={<Catalog/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/PaymentMethod" element={<PaymentMethod/>}/>
      </Routes>
    </div>
  );
}

export default App;
