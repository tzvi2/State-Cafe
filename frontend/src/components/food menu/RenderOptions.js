import React from 'react';
import styles from '../styles/food menu styles/RenderOptions.module.css';
import { centsToFormattedPrice } from '../../utils/priceUtilities';

const RenderOptions = ({ menuItem, selectedOptions, handleOptionChange }) => {
  return (
    <div className={styles.optionsList}>
      {/* Render option groups */}
      {menuItem.optionGroups && menuItem.optionGroups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.optionGroup}>
          <h4>{group.title}</h4>
          {group.options.map((option, optionIndex) => (
            <div key={optionIndex} className={styles.optionRow}>
              <div className={styles.checkbox_and_label}>
                <input
                  className={styles.optionInput}
                  type="checkbox"
                  id={`group-${groupIndex}-option-${optionIndex}`}
                  checked={selectedOptions.some(selectedOption => selectedOption.title === option.title && selectedOption.group === group.title)}
                  onChange={(e) => handleOptionChange(option, e.target.checked, group.title)}
                />
                <label 
                  className={styles.optionLabel}
                  htmlFor={`group-${groupIndex}-option-${optionIndex}`}>{option.title || option.weight} (+{centsToFormattedPrice(option.price)})
                </label>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Render individual options */}
      {menuItem.options && menuItem.options.map((option, optionIndex) => (
        <div key={`individual-${optionIndex}`} className={styles.optionGroup}>
          <div className={styles.optionRow}>
            <div className={styles.checkbox_and_label}>
              <input
                className={styles.optionInput}
                type="checkbox"
                id={`individual-option-${optionIndex}`}
                checked={selectedOptions.some(selectedOption => selectedOption.title === option.title && !selectedOption.group)}
                onChange={(e) => handleOptionChange(option, e.target.checked)}
              />
              <label 
                className={styles.optionLabel}
                htmlFor={`individual-option-${optionIndex}`}>{option.title} (+{centsToFormattedPrice(option.price)})
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RenderOptions;
