import React from 'react'
import ContactSlide from './home page slides/ContactSlide'
import DescriptionSlide from './home page slides/DescriptionSlide'
import FeaturedSlide from './home page slides/featured slide/FeaturedSlide'
import './styles/Home.css'
import WelcomeSlide from './home page slides/WelcomeSlide'
import StepsSlide from './home page slides/StepsSlide'

function Home() {
	return (
		<div className='homePage'>
			<DescriptionSlide />
			<WelcomeSlide />
			<StepsSlide />
			<FeaturedSlide />
			<ContactSlide />

		</div>
	)
}

export default Home