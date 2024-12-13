import React from 'react'
import styles from '../styles/home page slides styles/WelcomeSlide.module.css'
import { CalendarCheck2, ShoppingBasket, DoorClosed } from 'lucide-react';
import logo from '../../images/logo.png'


function WelcomeSlide() {

	const steps = [
		{ text: "Select your delivery date", image: "https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/misc%2Fcalendar%20image.png?alt=media&token=23191505-797c-4648-9ed5-afb72f388d86" },
		{ text: "Choose your items and checkout", image: "https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/misc%2Fcart.png?alt=media&token=a8775f08-2658-45c0-b8b1-73c5eb2b9d66" },
		{ text: "Enjoy your food", image: "https://firebasestorage.googleapis.com/v0/b/state-cafe.appspot.com/o/misc%2Fdoor.png?alt=media&token=4c12625f-585c-45f3-8e27-bbd044a942f7" }
	];

	return (
		<div className={styles.welcomeSlide}>
			<p className={styles.header}>Welcome to State Cafe.</p>
			{/* <img src={logo} className={styles.logo}></img> */}
			<p className={styles.sub_header}>Based in One500, we deliver <strong>ready-to-eat kosher food</strong> in the Teaneck area.</p>

			{/* <div className={styles.scrolling_steps_animation}>
				{steps.map((step, index) => (
					<div key={index}>
						<p>{step.text}</p>
						<img src={step.image}></img>
					</div>
				))}
			</div> */}
		</div>
	)
}

export default WelcomeSlide 