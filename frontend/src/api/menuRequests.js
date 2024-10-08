import apiUrl from '../config';

export const getMenuItems = async (category = '') => {
  // returns all items (in a specific category, if specified)
  try {
    // Encode the category to ensure it's a valid URL component
    const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${apiUrl}/menu-data${categoryParam}`);
    //const res = await fetch(`http://localhost:8000/menu-data${categoryParam}`);

    if (!res.ok) {
      throw new Error('Couldn\'t retrieve menu data.');
    }

    const data = await res.json();
    return data;

  } catch (err) {
    console.error(err);
    return []
  }
}

export const getMenuAndStockForDate = async (date) => {
  console.log('getting menu and stock for date ', date)
  try {
    const response = await fetch(`${apiUrl}/menu-data/menuWithStock?date=${date}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getMenuItemByItemId = async (itemId) => {
  try {

    const res = await fetch(`${apiUrl}/menu-data/by-item-id/${itemId}`);
    if (!res.ok) {
      throw new Error(`Couldn't retrieve menu item data for itemId: ${itemId}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error getting menu item by itemId:', err);
    return null;
  }
}

export const addMenuItem = async (menuItem) => {
  try {
    const response = await fetch(`${apiUrl}/edit-menu/add-menu-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuItem),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

export const updateMenuItemActiveStatus = async (itemId, isActive) => {
  try {
    const response = await fetch(`${apiUrl}/edit-menu/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId,
        active: isActive,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating menu item status:', error);
    throw error;
  }
};


export const updateMenuItem = async (menuItemDetails) => {
  try {
    const response = await fetch(`${apiUrl}/edit-menu/update-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuItemDetails),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (documentId) => {
  try {
    const response = await fetch(`${apiUrl}/edit-menu/delete-menu-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete menu item');
    }

    // Check if the response has content before parsing it as JSON
    const text = await response.text(); // Get the response body as text
    const data = text ? JSON.parse(text) : {}; // Parse text as JSON if not empty, otherwise return an empty object

    return data;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

