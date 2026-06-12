import logo from './assets/images/logo.svg';
import backgroundLogo from './assets/images/BackgroundLogo.svg';
import './App.css';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Advantages from './components/Advantages/Advantages';
import Reviews from './components/Reviews/Reviews';

function App() {
  return (
    <div>
      <Header/>
      <Hero/>
      <Advantages/>
      <Reviews/>
      <img src={backgroundLogo} className='backgroundLogo'></img>
    </div>

  );
}

export default App;
