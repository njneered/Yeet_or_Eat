import React, { useState } from 'react';
import Header from '../components/Header';
import SearchForRestaurant from '../components/SearchForRestaurant';
import './WannaEat.css'

const WannaEat = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [selectedRestaurants, setSelectedRestaurants] = useState([]);

    const handleSelectRestaurant = (restaurant) => {
        setSelectedRestaurants((prev) => [...prev, restaurant]);
        setShowSearch(false);
    };

    return (
        <div className ="wanna-eat-page">
            <Header />
            <h2>What You Wanna Eat</h2>
            <button onClick={() => setShowSearch(true)} className="add-restaurant-button">+ Add a Restaurant</button>
            {showSearch && (
                <SearchForRestaurant
                    onSelect={handleSelectRestaurant}
                    onClose={() => setShowSearch(false)}
                />    
            )}    
            
            <div className="restaurant-list">
                {selectedRestaurants.map((restaurant, index) => (
                    <div className="mini-card" key={index}>
                        <h4>{restaurant.name}</h4>
                        <p>{restaurant.location}</p>
                    </div>    
                ))}
            </div>

        </div>
    );
};

export default WannaEat;