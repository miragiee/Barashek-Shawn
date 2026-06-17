import styles from "./styles/PaymentMethod.module.css";

import logoDark from "../assets/icons/logo_dark.svg";
import ozonIcon from "../assets/icons/ozon.svg";
import vtbIcon from "../assets/icons/vtb.svg";
import sberIcon from "../assets/icons/sber.svg";
import tbankIcon from "../assets/icons/tbank.svg";
import goBackArrow from "../assets/icons/go_back_arrow.svg";
import { Link } from "react-router-dom";

const banks = [
    {
        name: "Озон Банк",
        icon: ozonIcon,
    },
    {
        name: "ВТБ",
        icon: vtbIcon,
    },
    {
        name: "Сбербанк",
        icon: sberIcon,
    },
    {
        name: "Тинькофф",
        icon: tbankIcon,
    },
];

export default function PaymentMethod() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* HEADER */}
                <div className={styles.header}>
                    <Link to="/Cart" className={styles.backButton}>
                        <img src={goBackArrow} alt="Назад" />
                        <span>Вернуться в корзину</span>
                    </Link>

                    <img
                        src={logoDark}
                        alt="Logo"
                        className={styles.logo}
                    />
                </div>

                {/* MAIN BLOCK */}
                <div className={styles.paymentBlock}>
                    <div className={styles.leftColumn}>
                        <h2 className={styles.title}>
                            Оплата через приложение банка
                        </h2>

                        <div className={styles.bankList}>
                            {banks.map((bank) => (
                                <button
                                    key={bank.name}
                                    className={styles.bankButton}
                                >
                                    <img
                                        src={bank.icon}
                                        alt={bank.name}
                                        className={styles.bankIcon}
                                    />
                                    <span>{bank.name}</span>
                                </button>
                            ))}
                        </div>

                        <button className={styles.payButton}>
                            Оплатить по СБП
                        </button>
                    </div>

                    <div className={styles.qrColumn}>
                        <h2 className={styles.title}>
                            Оплата через СБП
                        </h2>

                        <img
                            src="/images/PaymentWithQR.png"
                            alt="QR код"
                            className={styles.qrImage}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}