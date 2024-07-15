import React from 'react';
import styles from '../styles/dashboard/IndividualOptions.module.css';

function IndividualOptions({ options, setOptions, removeOption }) {
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  return (
    <div>
      {options.map((option, index) => (
        <div key={index} className={styles.option}>
          <input
            type="text"
            placeholder="Option Title"
            value={option.title}
            onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            value={option.price}
            onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
          />
          <input
            type="number"
            placeholder="Time to Cook"
            value={option.timeToCook}
            onChange={(e) => handleOptionChange(index, 'timeToCook', e.target.value)}
          />
          <button type="button" onClick={() => removeOption(index)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => setOptions([...options, { title: '', price: '', timeToCook: '' }])}>
        Add Option
      </button>
    </div>
  );
}

export default IndividualOptions;
