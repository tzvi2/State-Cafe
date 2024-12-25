import React from 'react'
import ContactSlide from './home page slides/ContactSlide'
import HeroSlide from './home page slides/HeroSlide'
import FeaturedSlide from './home page slides/featured slide/FeaturedSlide'
import './styles/Home.css'
import WelcomeSlide from './home page slides/WelcomeSlide'
import StepsSlide from './home page slides/StepsSlide'

function Home() {
	return (
		<div className='homePage'>
			<HeroSlide />
			<WelcomeSlide />
			<StepsSlide />
			<FeaturedSlide />
			<ContactSlide />

		</div>
	)
}

export default Home