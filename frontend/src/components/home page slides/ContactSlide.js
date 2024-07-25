import React from 'react'
import { Phone } from 'lucide-react'
import styles from '../styles/home page slides styles/ContactSlide.module.css'

function ContactSlide() {
	return (
		<div className={styles.slide}>
			<div className={styles.contact}>
				<h2>Contact Us</h2>
				<div className={styles.phoneLine}>
					<p>Call/Text:</p>
					<a href="tel:5518379907">(551) 837-9907</a>
				</div>
				<div className={styles.emailLine}>
					<p className={styles.text}>Email:</p>
					<a href="mailto:support@statecafeteaneck.com">support@statecafeteaneck.com</a>
				</div>
			</div>
		</div>
	)
}

export default ContactSlide