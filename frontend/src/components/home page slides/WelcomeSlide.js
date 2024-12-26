import React from 'react'
import styles from '../styles/home page slides styles/WelcomeSlide.module.css'
import { CalendarCheck2, ShoppingBasket, DoorClosed } from 'lucide-react';
import logo from '../../images/logo.png'


function WelcomeSlide() {

	return (
		<div className={styles.welcomeSlide}>
			<p className={styles.header}>Happy Chanukah from State Cafe.</p>
			{/* <img src={logo} className={styles.logo}></img> */}
			<p className={styles.sub_header}>Based in One500, we deliver <strong>ready-to-eat kosher food</strong> to the Teaneck community.</p>
			<p className={styles.sub_header}>At State Cafe, we prioritize high quality ingredients, giving you a difference you can taste and feel.</p>
		</div>
	)
}

export default WelcomeSlide 