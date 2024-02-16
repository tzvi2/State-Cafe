import React from 'react'
import AboutSlide from './home page slides/AboutSlide'
import ContactSlide from './home page slides/ContactSlide'
import DescriptionSlide from './home page slides/DescriptionSlide'
import MenuSlide from './home page slides/MenuSlide'
import './styles/Home.css'

function Home() {
	return (
		<div className='homePage'>
			<DescriptionSlide />
			<MenuSlide />
			<ContactSlide />
		</div>
	)
}

export default Home