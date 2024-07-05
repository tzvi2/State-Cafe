import React, { useState, useEffect } from 'react';

function IndividualOptions({ options, setOptions }) {
  const [addingNewOption, setAddingNewOption] = useState(false);
  const [newOption, setNewOption] = useState({
    title: '',
    timeToCook: '',
    price: ''
  });

  const handleAddOption = () => {
    setAddingNewOption(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOption((prevOption) => ({
      ...prevOption,
      [name]: value,
    }));
  };

  const handleSaveOption = () => {
    setOptions([...options, newOption]);
    setNewOption({ title: '', timeToCook: '', price: '' });
    setAddingNewOption(false);
  };

  useEffect(() => {
    console.log('options:', options);
  }, [options]);

  return (
    <div>
      

      {addingNewOption && (
        <div>
          <input
            type="text"
            name="title"
            value={newOption.title}
            onChange={handleChange}
            placeholder="Option Title"
          />
          <input
            type="number"
            name="price"
            value={newOption.price}
            onChange={handleChange}
            placeholder="Option Price"
          />
          <input
            type="number"
            name="timeToCook"
            value={newOption.timeToCook}
            onChange={handleChange}
            placeholder="Time to Cook"
          />
          <button type="button" onClick={() => setAddingNewOption(false)}>
            Cancel
          </button>
          <button type="button" onClick={handleSaveOption}>
            Save
          </button>
					
        </div>
      )}
      <ul>
        {Array.isArray(options) && options.map((option, index) => (
          <li key={index}>
            {option.title} - {option.price} - {option.timeToCook}
          </li>
        ))}
				{!addingNewOption && (
        <button type="button" onClick={handleAddOption}>
          Add New Option
        </button>
      )}
      </ul>
			
    </div>
  );
}

export default IndividualOptions;
