import logo from './assets/images/logo.svg';
import backgroundLogo from './assets/images/BackgroundLogo.svg';
import './App.css';

import { Routes, Route } from 'react-router-dom';

import MainPage from './pages/MainPage';
import Catalog from './pages/Catalog';
import DishPage from './pages/DishPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/DishPage" element={<DishPage/>}/>
        <Route path="/Catalog" element={<Catalog/>}/>
      </Routes>
    </div>
  );
}

export default App;
