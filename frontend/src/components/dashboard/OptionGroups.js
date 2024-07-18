import React from 'react';
import styles from '../styles/dashboard/OptionGroups.module.css';

const OptionGroups = ({ optionGroups, setOptionGroups }) => {

  const handleOptionGroupChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGroups = optionGroups.map((group, i) =>
      i === index ? { ...group, [name]: value } : group
    );
    setOptionGroups(updatedGroups);
  };

  const handleOptionChange = (groupIndex, optionIndex, e) => {
    const { name, value } = e.target;
    const updatedGroups = optionGroups.map((group, i) => {
      if (i === groupIndex) {
        const updatedOptions = group.options.map((option, j) =>
          j === optionIndex ? { ...option, [name]: value } : option
        );
        return { ...group, options: updatedOptions };
      }
      return group;
    });
    setOptionGroups(updatedGroups);
  };

  const handleBlur = (index, e) => {
    const { name, value } = e.target;
    const intValue = parseInt(value, 10);
    const validValue = isNaN(intValue) ? 0 : intValue;
    const updatedGroups = optionGroups.map((group, i) =>
      i === index ? { ...group, [name]: validValue } : group
    );
    setOptionGroups(updatedGroups);
  };

  const addOptionGroup = () => {
    const newGroup = { title: '', minSelection: 1, maxSelection: 3, options: [] };
    setOptionGroups([...optionGroups, newGroup]);
  };

  const addOptionToGroup = (groupIndex) => {
    const newOption = { title: '', timeToCook: '', price: '' };
    const updatedGroups = optionGroups.map((group, i) =>
      i === groupIndex ? { ...group, options: [...group.options, newOption] } : group
    );
    setOptionGroups(updatedGroups);
  };

  const removeOptionGroup = (index) => {
    setOptionGroups(optionGroups.filter((_, i) => i !== index));
  };

  const removeOptionFromGroup = (groupIndex, optionIndex) => {
    const updatedGroups = optionGroups.map((group, i) => {
      if (i === groupIndex) {
        const updatedOptions = group.options.filter((_, j) => j !== optionIndex);
        return { ...group, options: updatedOptions };
      }
      return group;
    });
    setOptionGroups(updatedGroups);
  };

  return (
    <div>
      <h4>Option Groups</h4>
      {optionGroups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.optionGroup}>
          <input
            name="title"
            value={group.title}
            onChange={(e) => handleOptionGroupChange(groupIndex, e)}
            placeholder="Group Title"
          />
          <input
            name="minSelection"
            type="number"
            value={group.minSelection}
            onChange={(e) => handleOptionGroupChange(groupIndex, e)}
            onBlur={(e) => handleBlur(groupIndex, e)}
            placeholder="Minimum Selection"
          />
          <input
            name="maxSelection"
            type="number"
            value={group.maxSelection}
            onChange={(e) => handleOptionGroupChange(groupIndex, e)}
            onBlur={(e) => handleBlur(groupIndex, e)}
            placeholder="Maximum Selection"
          />
          <h5>Options in this Group</h5>
          {group.options.map((option, optionIndex) => (
            <div key={optionIndex} className={styles.option}>
              <input
                name="title"
                value={option.title}
                onChange={(e) => handleOptionChange(groupIndex, optionIndex, e)}
                placeholder="Option Title"
              />
              <input
                name="price"
                type="number"
                value={option.price}
                onChange={(e) => handleOptionChange(groupIndex, optionIndex, e)}
                placeholder="Option Price"
              />
              <input
                name="timeToCook"
                type="number"
                value={option.timeToCook}
                onChange={(e) => handleOptionChange(groupIndex, optionIndex, e)}
                placeholder="Time to Cook"
              />
              <button type="button" onClick={() => removeOptionFromGroup(groupIndex, optionIndex)}>
                Remove Option
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addOptionToGroup(groupIndex)}>
            Add Option to Group
          </button>
          <button type="button" onClick={() => removeOptionGroup(groupIndex)}>
            Remove Group
          </button>
        </div>
      ))}
      <button type="button" onClick={addOptionGroup}>
        Add New Option Group
      </button>
    </div>
  );
};

export default OptionGroups;
