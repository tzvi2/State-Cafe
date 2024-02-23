import React, {useEffect} from 'react'
import styles from '../styles/pages styles/About.module.css'

function About() {

  return (
    <div className={styles.aboutPage}>
      <h1>About Us</h1>
      
      <div className={styles.paragraphs}>
        <p>👋 Hi, we're Tzvi and Yakira - the duo behind State Cafe. We want to make people feel good with our delicious homemade food.</p>
        
        <p>
          🏡 Doing it from scratch: An end product can only be as good as it's components - or ingredients. That's why we favor homemade and high-quality ingredients to give you the very best result.
        </p>
        
        <p>
          ✨ Crafting culinary magic:
          We use fresh ingredients and make each dish with love and with no shortcuts.
        </p>
        
        <p>
          🚀 Unbeatable freshness and speed. Delivery just five minutes after your order is cooked.*
        </p>
        <p>
          🙌 Hassle-free delivery: No more awkward encounters with unknown drivers - we'll leave your food at your door. Wait till we're gone, crack the door, grab your food, and enjoy.
        </p>
        <p>
          📜 Kashrus: We keep a fully kosher kitchen and 100% of ingredients used are kosher.
        </p>
        
        <p>
          🙏 Thank you for being a part of our journey. If you have any comments, questions, or concerns, we'd love to hear from you.
          <br></br><br></br>
          Tzvi & Yakira
        </p>
        <p className={styles.disclaimer}>
          *Delivery speed for one500 residents.
        </p>
      </div>
    </div>
  )
}

export default About