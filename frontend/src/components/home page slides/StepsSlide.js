import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles/home page slides styles/StepsSlide.module.css';
import { CalendarCheck2, ShoppingCart, DoorClosed } from 'lucide-react';

function StepsSlide() {
    const [isVisible, setIsVisible] = useState(false);
    const stepsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (stepsRef.current) {
            observer.observe(stepsRef.current);
        }

        return () => {
            if (stepsRef.current) {
                observer.unobserve(stepsRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.stepsSlide}>
            <p className={styles.header}>How it works</p>
            <div className={styles.steps} ref={stepsRef}>
                <div className={`${styles.step} ${isVisible ? styles.step1 : ''}`}>
                    <CalendarCheck2 className={styles.icon}/>
                    <p>Select a delivery date</p>
                </div>
                <div className={`${styles.step} ${isVisible ? styles.step2 : ''}`}>
                    <ShoppingCart className={styles.icon}/>
                    <p>Choose your items and checkout</p>
                </div>
                <div className={`${styles.step} ${isVisible ? styles.step3 : ''}`}>
                    <DoorClosed className={styles.icon}/>
                    <p>Your food is delivered</p>
                </div>
            </div>
        </div>
    );
}

export default StepsSlide;
