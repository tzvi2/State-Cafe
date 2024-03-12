import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'react-time-picker';
import "react-time-picker/dist/TimePicker.css";
import { getMenuItems } from '../../api/menuRequests';
import { useAuth } from '../../hooks/useAuth';


const Dashboard = () => {
  const [selectedDates, setSelectedDates] = useState([null, null]); // Initialize with null values for both start and end dates
  const [openHours, setOpenHours] = useState({});
  const [menuItems, setMenuItems] = useState([]);
	const { user, signInWithGoogle } = useAuth(); 
	const AUTHORIZED_EMAILS = ['tzvib8@gmail.com']; 
	const isAuthorized = user && AUTHORIZED_EMAILS.includes(user.email);

	useEffect(() => {
		console.log('selected dates ', selectedDates)
	}, [selectedDates])

	useEffect(() => {
		console.log('open hours ', openHours)
	}, [openHours])

  useEffect(() => {
    const fetchMenuItems = async () => {
      const items = await getMenuItems(); 
      setMenuItems(items.map(item => ({ ...item, isActive: false, quantity: 0 })));
    };

    fetchMenuItems();
  }, []);

  const addRange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const newRange = { start: '10:00', end: '12:00' }; // Default range values
    const updatedOpenHours = { 
      ...openHours, 
      [dateString]: [...(openHours[dateString] || []), newRange] 
    };
    setOpenHours(updatedOpenHours);
  };

  const removeRange = (date, rangeIndex) => {
    const dateString = date.toISOString().split('T')[0];
    const ranges = [...openHours[dateString]];
    ranges.splice(rangeIndex, 1);
    setOpenHours({ ...openHours, [dateString]: ranges });
  };

  const handleTimeChange = (date, rangeIndex, type, value) => {
    const dateString = date.toISOString().split('T')[0];
    const ranges = [...openHours[dateString]];
    ranges[rangeIndex] = { ...ranges[rangeIndex], [type]: value };
    setOpenHours({ ...openHours, [dateString]: ranges });
  };

  const handleMenuItemChange = (index, key, value) => {
    const updatedItems = [...menuItems];
    updatedItems[index] = { ...updatedItems[index], [key]: value };
    setMenuItems(updatedItems);
  };

	if (!user) {
    // Redirects to the home page or shows a login button if the user is not authenticated
    return (
      <div>
        <h2>You must be logged in to view this page.</h2>
        <button onClick={signInWithGoogle}>Login with Google</button>
      </div>
    );
  }

	if (!isAuthorized) {
    return <div>Sorry, you are not authorized to view this page 🤔</div>;
  }


	return (
    <div>
      <DatePicker
        selected={selectedDates[0]}
        onChange={(dates) => setSelectedDates(dates)}
        startDate={selectedDates[0]}
        endDate={selectedDates[1]}
        selectsRange
        inline
      />
      {selectedDates[0] && selectedDates[1] && // Ensure both dates are selected
        Array.from(new Set([selectedDates[0].toISOString().split('T')[0], selectedDates[1].toISOString().split('T')[0]])).map((dateString, index) => {
          const date = new Date(dateString);
          return (
            <div key={index}>
              {/* <h3>{date.toDateString()}</h3> */}
              {openHours[dateString] && openHours[dateString].map((range, rangeIndex) => (
                <div key={rangeIndex}>
                  <TimePicker value={range.start} onChange={(value) => handleTimeChange(date, rangeIndex, 'start', value)} />
                  <TimePicker value={range.end} onChange={(value) => handleTimeChange(date, rangeIndex, 'end', value)} />
                  <button onClick={() => removeRange(date, rangeIndex)}>Remove</button>
                </div>
              ))}
              <button onClick={() => addRange(date)}>Add New Range</button>
            </div>
          );
        })
      }
      {menuItems.map((item, index) => (
        <div key={item.id || index}>
          <span>{item.title}</span>
          {/* <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleMenuItemChange(index, 'quantity', e.target.value)}
          /> */}
          <input
            type="checkbox"
            checked={item.isActive}
            onChange={(e) => handleMenuItemChange(index, 'isActive', e.target.checked)}
          />
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

