import React from 'react';
import styles from '../styles/food menu styles/RenderOptions.module.css';
import { centsToFormattedPrice } from '../../utils/priceUtilities';

const RenderOptions = ({ menuItem, selectedOptions, handleOptionChange }) => {
  // Separate the options into groups and individual options for organized rendering
  const optionGroups = menuItem.options?.filter(option => option.type === 'group') || [];
  const individualOptions = menuItem.options?.filter(option => option.type !== 'group') || [];

  return (
    <div className={styles.optionsList}>
      {/* First render option groups */}
      {optionGroups.map((group, index) => (
        <div key={index} className={styles.optionGroup}>
          <h4>{group.group}</h4>
          {group.options.map((subOption, subIndex) => (
            <div key={subIndex} className={styles.optionRow}>
              <div className={styles.checkbox_and_label}>
                <input
                  id={`group-${index}-option-${subIndex}`}
                  className={styles.optionInput}
                  type="checkbox"
                  checked={selectedOptions.some(selectedOption => selectedOption.title === subOption.title && selectedOption.group === group.group)}
                  onChange={(e) => handleOptionChange(subOption, e, group)}
                />
                <label htmlFor={`group-${index}-option-${subIndex}`} className={styles.optionLabel}>{subOption.title}</label>
              </div>
              <p className={styles.price}>(+{centsToFormattedPrice(subOption.price)})</p>
            </div>
          ))}
        </div>
      ))}


		<div className={styles.optionGroup}>
      {individualOptions.map((option, index) => (
        <div key={`individual-${index}`} className={styles.optionRow}>
          <div className={styles.checkbox_and_label}>
						<input
							id={`individual-option-${index}`}
							className={styles.optionInput}
							type="checkbox"
							checked={selectedOptions.some(selectedOption => selectedOption.title === option.title && selectedOption.group === 'individual')}
							onChange={(e) => handleOptionChange(option, e)}
						/>
						<label htmlFor={`individual-option-${index}`} className={styles.optionLabel}>
							{option.title}
						</label>
					</div>
					<p className={styles.price}>(+{centsToFormattedPrice(option.price)})</p>
        </div>
      ))}
    	</div>
		</div>
  );
};

export default RenderOptions;
