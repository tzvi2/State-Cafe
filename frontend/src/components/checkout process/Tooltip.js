import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/checkout process styles/Tooltip.module.css';

const Tooltip = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);

  const handleDocumentClick = (event) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const handleClick = () => {
    setVisible(!visible);
  };

  return (
    <div className={styles.tooltipContainer} ref={tooltipRef}>
      <span className={styles.infoIcon} onClick={handleClick}>i</span>
      {visible && <div className={styles.tooltip}>{message}</div>}
    </div>
  );
};

export default Tooltip;
