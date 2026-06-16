import logo from './assets/images/logo.svg';
import backgroundLogo from './assets/images/BackgroundLogo.svg';
import './App.css';

import MainPage from './pages/MainPage'
import Catalog from './pages/Catalog';

function App() {
  return (
    <div className="App">
      {
        <MainPage/>
      };
      {
        <Catalog/>  
      }
    </div>
  );
}

export default App;
