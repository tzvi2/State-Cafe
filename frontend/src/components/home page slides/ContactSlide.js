import React from 'react'
import { Phone } from 'lucide-react'
import styles from '../styles/home page slides styles/ContactSlide.module.css'
import logo from '../../images/logo.png'
import instagramIcon from '../../images/Instagram_Glyph_Gradient.png'

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
				<div className={styles.instagramLine}>
					<p>Follow us on Instagram:</p>
					<a className={styles.icon_container} href='https://www.instagram.com/state_cafe_teaneck' target="_blank">
						<img className={styles.instagramIcon} src={instagramIcon} alt='Instagram'></img>
					</a>
				</div>

			</div>

		</div>
	)
}

export default ContactSlide