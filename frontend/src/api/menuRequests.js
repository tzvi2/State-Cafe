export const getMenuItems = async (category = '') => {
  // returns all items (in a specific category, if specified)
  try {
    // Encode the category to ensure it's a valid URL component
    const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`https://state-cafe.vercel.app/menu-data${categoryParam}`);

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
export const getQuickViewMenu = async () => {
  try {
    const response = await fetch(`https://state-cafe.vercel.app/menu-data/quickView`)
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
    return []
  }
  
}

export const getMenuItemByItemId = async (itemId) => {
	try {
			
			const res = await fetch(`https://state-cafe.vercel.app/menu-data/by-item-id/${itemId}`);
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
    const response = await fetch(`https://state-cafe.vercel.app/edit-menu/add-menu-item`, {
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
    const response = await fetch(`https://state-cafe.vercel.app/edit-menu/update-status`, {
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
    const response = await fetch(`https://state-cafe.vercel.app/edit-menu/update-item`, {
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
  console.log('deleting menu item with id: ', documentId)
  try {
    const response = await fetch(`https://state-cafe.vercel.app/edit-menu/delete-menu-item`, {
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

