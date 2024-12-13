import React from 'react';
import styles from '../components/styles/route styles/UnauthorizedPage.module.css'


const UnauthorizedPage = () => {
  return (
    <div className={styles.page}>
      <h1>Unauthorized</h1>
      <p className={styles.UnauthorizedPage}>You're in the wrong neighborhood son😤</p>
    </div>
  );
};

export default UnauthorizedPage;
