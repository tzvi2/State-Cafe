import React, { createContext, useContext, useState } from "react";
import { getActiveMenuItems } from "../api/menuRequests";
import { getStockForDate } from "../api/stockRequests";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
	const [menuItems, setMenuItems] = useState([]);
	const [stock, setStock] = useState({});
	const [stockLastFetched, setStockLastFetched] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchMenuItems = async () => {
		try {
			const activeItems = await getActiveMenuItems();
			setMenuItems(activeItems);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching menu items:", error);
			setIsLoading(false);
		}
	};

	const fetchStock = async (deliveryDate) => {
		if (deliveryDate) {
			const now = new Date();
			// Refetch stock if more than 10 seconds have passed
			if (!stockLastFetched || now - stockLastFetched > 10000) {
				try {
					const stockData = await getStockForDate(deliveryDate);
					setStock(stockData);
					setStockLastFetched(now);
				} catch (error) {
					console.error("Error fetching stock data:", error);
				}
			}
		}
	};

	return (
		<MenuContext.Provider
			value={{
				menuItems,
				setMenuItems,
				stock,
				setStock,
				isLoading,
				setIsLoading,
				fetchMenuItems, // Expose this function
				fetchStock,
			}}
		>
			{children}
		</MenuContext.Provider>
	);
};


export const useMenu = () => useContext(MenuContext);
