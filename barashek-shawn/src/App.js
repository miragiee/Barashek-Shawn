import logo from './logo.svg';
import backgroundLogo from './assets/images/BackgroundLogo.svg';
import './App.css';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Advantages from './components/Advantages/Advantages';

function App() {
  return (
    <div>
      <Header/>
      <Hero/>
      <Advantages/>
      <img src={backgroundLogo} className='backgroundLogo'></img>
    </div>

  );
}

export default App;
