import React, { useEffect, useState, useRef } from 'react';
import Menuitem from "./Menuitem";
import CategoryBar from "./CategoryBar";
import styles from '../styles/food menu styles/Menu.module.css';
import { getMenuItems } from "../../api/menuRequests";

const categories = ["breakfast", "pasta", "sushi", "sandwiches", "baked goods", "soup", "coffee"];

export default function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const categoryRefs = useRef({});

    useEffect(() => {
        setIsLoading(true);
        const fetchAllMenuItems = async () => {
            const items = await getMenuItems();
            setMenuItems(items);
            setIsLoading(false);
        };

        fetchAllMenuItems();
    }, []);

    // This effect might log a large amount of data if menuItems is a large array.
    // Consider removing it once you've confirmed your data fetching works as expected.
    useEffect(() => {
        console.log(menuItems);
    }, [menuItems]);

    const handleScroll = () => {
        const halfwayPoint = window.innerHeight / 2 + window.scrollY;
        let newActiveCategory = null;

        // Determine which category is at the halfway point
        categories.forEach(category => {
            const el = categoryRefs.current[category];
            if (el) {
                const { offsetTop, clientHeight } = el;
                if (offsetTop <= halfwayPoint && (offsetTop + clientHeight) >= halfwayPoint) {
                    newActiveCategory = category;
                }
            }
        });

        if (newActiveCategory && newActiveCategory !== activeCategory) {
            setActiveCategory(newActiveCategory);
        }
    };

    // Attach the scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeCategory]); // Reacting to changes in activeCategory

    return (
        <>
            <CategoryBar categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}/>
            <div className={styles.menuContainer}>
                {categories.map((category) => (
                    <div key={category} ref={(el) => categoryRefs.current[category] = el} className={styles.categoryContainer}>
                        {/* <h2>{category}</h2> */}
                        <div className={styles.menu}>
                            {menuItems.filter(item => item.category === category).map((item, index) => (
                                <Menuitem key={index} item={item} />
                            ))}
                        </div>
                    </div>
                ))}
                <div className={styles.loadingContainer}>
                    {isLoading && <p>Loading...</p>}
                </div>
                
            </div>
        </>
    );
}
