import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import Advantages from '../components/Advantages/Advantages';
import Reviews from '../components/Reviews/Reviews';
import Recommendations from '../components/Recommendations/Recommendations';
import BookingForm from '../components/BookingForm/BookingForm';
import Footer from '../components/Footer/Footer';

export default function MainPage(){
    return(
        <div>
            <Header/>
            <Hero/>
            <Advantages/>
            <Reviews/>
            <Recommendations/>
            <BookingForm/>
            <Footer/>
        </div>
    );
}