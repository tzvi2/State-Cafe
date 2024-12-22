import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MoveLeft } from 'lucide-react'
import './styles/BackArrow.css'

function BackArrow() {
	const navigate = useNavigate()
	return (
		<MoveLeft className='arrow' onClick={() => navigate(-1)} />
	)
}

export default BackArrow