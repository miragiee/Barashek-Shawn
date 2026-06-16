import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Govyadina from '../components/Govyadina/Govyadina';
import Baranina from '../components/Baranina/Baranina';
import Svinina from '../components/Svinina/Svinina';

export default function Catalog() {
  return (
    <div>
      <Header/>
        <Govyadina/>
        <Baranina/>
        <Svinina/>
      <Footer/>
    </div>

  );
}