import Header from "../components/Header/Header";

export default function Login () {
    return (
        <div>
            <Header/>
            <h1>Вход</h1>
            <input placeholder="Почта"/>
            <input placeholder="Пароль"/>
        </div>
    )
}