import React from 'react'
import styles from '../styles/pages styles/About.module.css'

function About() {
  return (
    <div className={styles.aboutPage}>
      <h1>About Us</h1>

      <p>👋 Hi, we're Tzvi and Yakira - the duo behind State Cafe. We want to share delicious homemade food that makes people feel good.</p>
      
      <p>
        🏡 Doing it from scratch: We believe an end product can only be as good as it's individual components - or ingredients - in this case. For this reason we favor home-made and high-quality ingredients for the best final result.
      </p>
      
      <p>
        ✨ Crafting culinary magic:
        Every dish we create is made fresh, with love, prepared with high quality ingredients and without shortcuts.
      </p>
      
      <p>
        🚀 Unbeatable freshness and speed. Delivery just five minutes after your order is cooked.* 
      </p>

      <p>
        🙌 Hassle-free delivery: We'll leave your food at your door - no more awkward encounters with mystery delivery drivers. Wait till we're gone, crack the door, grab your food and enjoy.
      </p>

      <p>
        📜 Kashrus: We keep a fully kosher kitchen and 100% of ingredients used are kosher. 
      </p>
      
      <p>
        🙏 Thank you for being a part of our journey. If you have any comments, questions, or concerns, we'd love to hear from you.
        <br></br><br></br>
        Tzvi & Yakira
      </p>

      <p>
        *For one500 residents. 
      </p>
    </div>
  )
}

export default About