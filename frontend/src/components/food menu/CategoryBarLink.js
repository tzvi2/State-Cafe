import React from 'react';
import { Link } from 'react-scroll';
import styles from '../styles/food menu styles/CategoryBarLink.module.css'; // Ensure this path is correct

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const CategoryBarLink = ({ to, active, onClick }) => {

  const className = active ? styles.active : '';
  return (
    <Link
      className={className} 
      to={to}
      spy={true}
      smooth={true}
      duration={500}
      onClick={onClick}
    >
      {capitalizeFirstLetter(to)}
    </Link>
  );
}

export default CategoryBarLink;
