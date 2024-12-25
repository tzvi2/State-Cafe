import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoveRight } from 'lucide-react';
import styles from '../styles/home page slides styles/DescriptionSlide.module.css';

function HeroSlide() {
    const words = ["Delicious", "Kosher", "Fresh", "High quality", "Satisfying", "Hot", "Amazing"];
    const [currentWord, setCurrentWord] = useState(words[0]);
    const [fade, setFade] = useState(false); // Start with fade set to false

    useEffect(() => {
        let timeoutId = setTimeout(() => {
            setFade(true);
        }, 100);

        let wordIndex = 0;
        const cycleWords = setInterval(() => {
            setFade(false); // Start fade out
            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length;
                setCurrentWord(words[wordIndex]);
                setFade(true);
            }, 2300);
        }, 5000);

        return () => {
            clearInterval(cycleWords);
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className={styles.heroSlide}>
            <div className={styles.backgroundOverlay}></div>
            <div className={styles.textContainer}>
                <h1>
                    <span className={`${styles.changingWord} ${fade ? styles.fadeIn : styles.fadeOut}`}>
                        {currentWord}
                    </span>
                    &nbsp;Food Right to Your Door
                </h1>
            </div>
            <div className={styles.buttonContainer}>
                <Link className={styles.heroButton} to='menu'>
                    Order Online
                    <MoveRight className={styles.heroArrow} />
                </Link>
            </div>
        </div>
    );
}

export default HeroSlide;
