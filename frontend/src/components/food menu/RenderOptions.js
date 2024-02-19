import React from 'react';
import { centsToFormattedPrice } from '../../utils/priceUtilities'; 
import { capitalizeFirstLetters } from '../../utils/stringUtilities'; 
import styles from '../styles/food menu styles/RenderOptions.module.css';

const RenderOptions = ({menuItem, selectedOptions, handleOptionChange}) => {

	// Separate grouped options and individual options
	const groupedOptions = menuItem.options?.filter(option => option.group) || [];
	const individualOptions = menuItem.options?.filter(option => !option.group) || [];

	return (
		<div className={styles.optionsList}>
			{groupedOptions.length > 0 && groupedOptions.map((option, index) => (
				<div key={index} className={styles.optionGroup}>
					<h3 className={styles.optionGroupName}>{capitalizeFirstLetters(option.group)}:</h3>
					{option.options.map((groupOption, groupIndex) => (
						<div key={groupIndex} className={styles.optionRow}>
							<div className={styles.checkbox_and_label}>
								<input
									type="checkbox"
									name={option.group}
									checked={selectedOptions.some(selectedOption => selectedOption.title === groupOption.title && selectedOption.group === option.group)}
									onChange={(e) => handleOptionChange(groupOption, e, option)}
									className={styles.optionInput}
								/>
								<label className={styles.optionLabel}>{capitalizeFirstLetters(groupOption.title)}</label>
							</div>
							<p className={styles.price}>(+{centsToFormattedPrice(groupOption.price)})</p>
						</div>
					))}
				</div>
			))}

			{individualOptions.length > 0 && (
				<div className={styles.optionGroup}>
					<h3 className={styles.optionGroupName}>Options:</h3>
					{individualOptions.map((option, index) => (
						<div key={index} className={styles.optionRow}>
							<div className={styles.checkbox_and_label}>
								<input
									type="checkbox"
									checked={selectedOptions.some(selectedOption => selectedOption.title === option.title)}
									onChange={(e) => handleOptionChange(option, e)}
									className={styles.optionInput}
								/>
								<label className={styles.optionLabel}>{capitalizeFirstLetters(option.title)}</label>
							</div>
							<p className={styles.price}>(+{centsToFormattedPrice(option.price)})</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default RenderOptions;
