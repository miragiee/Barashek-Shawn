import logo from './assets/images/logo.svg';
import backgroundLogo from './assets/images/BackgroundLogo.svg';
import './App.css';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Advantages from './components/Advantages/Advantages';
import Reviews from './components/Reviews/Reviews';
import Recommendations from './components/Recommendations/Recommendations';
import BookingForm from './components/BookingForm/BookingForm';

function App() {
  return (
    <div>
      <Header/>
      <Hero/>
      <Advantages/>
      <Reviews/>
      <Recommendations/>
      <BookingForm/>
      <img src={backgroundLogo} className='backgroundLogo'></img>
    </div>

  );
}

export default App;
