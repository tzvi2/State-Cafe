import React, {useEffect} from 'react'
import styles from '../styles/pages styles/About.module.css'

function About() {

  return (
    <div className={styles.aboutPage}>
      <h1>About Us</h1>
      
      <div className={styles.paragraphs}>
        <p>👋 <strong>Hi, we're Tzvi and Yakira</strong> - the duo behind State Cafe. Our goal is to give people a great experience with fresh, high-quality food.</p>
        
        <p>
          🏡 <strong>Doing it from scratch:</strong> An end product can only be as good as it's ingredients. That's why we favor homemade, fresh, and high-quality ingredients to give you the very best result.
        </p>
        
        <p>
          🚀 <strong>Unbeatable freshness and speed:</strong> We carefully choose our packaging for every dish and test the method of delivery before launcing a new product. Beside for optimal delivery packaging, we deliver your food just five minutes after your order is cooked.*
        </p>
        <p>
          🚪 <strong>Seamless delivery:</strong> No more awkward encounters with unknown drivers, and certainly no tip screens - we just leave your food at your door. Wait till we're gone, crack the door, grab your food, and enjoy. 
        </p>
        <p>
          📜 <strong>Kashrus:</strong> We keep a fully kosher kitchen and 100% of ingredients used are kosher. Dairy products are chalav stam unless specifically marked otherwise.
        </p>
        
        <p>
          🙏 Thank you for being a part of our journey. If you have any comments, questions, or concerns, we'd love to hear from you.<br></br><br></br> Email: support@statecafeteaneck.com
          
          
        </p>
        <p className={styles.disclaimer}>
          *Delivery speed for one500 residents.
        </p>
      </div>
    </div>
  )
}

export default About