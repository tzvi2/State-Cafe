import React, { useState } from 'react';
import styles from '../styles/home page slides styles/WelcomeSlide.module.css';
import logo from '../../images/logo.png';

function WelcomeSlide() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [disableHover, setDisableHover] = useState(false);

	const handleLogoClick = () => {
		if (isSpinning) return;

		setIsSpinning(true);
		setDisableHover(true);
		setTimeout(() => {
			setIsSpinning(false);
		}, 600);
	};

	const handleMouseLeave = () => {
		setDisableHover(false);
	};

	return (
		<div className={styles.welcomeSlide}>
			<img
				src={logo}
				className={`${styles.logo} ${isSpinning ? styles.spin : ''} ${disableHover ? styles.no_hover : ''}`}
				onClick={handleLogoClick}
				onMouseLeave={handleMouseLeave}
				alt="State Cafe Logo"
			/>
			<p className={styles.sub_header}>
				Based in One500, we deliver <strong>ready-to-eat kosher food</strong> to the Teaneck community.
			</p>
			<p className={styles.sub_header}>
				At State Cafe, we prioritize high-quality ingredients, giving you a difference you can taste and feel.
			</p>
		</div>
	);
}

export default WelcomeSlide;
