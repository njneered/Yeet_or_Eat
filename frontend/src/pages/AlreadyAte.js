import React, { useState } from 'react';
import Header from '../components/Header';
import SearchForRestaurant from '../components/SearchForRestaurant';
import './AlreadyAte.css';

const AlreadyAte = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurants((prev) => [...prev, restaurant]);
    setShowSearch(false);
  };

  const handleRemoveRestaurant = (removeIndex) => {
    setSelectedRestaurants((prev) =>
        prev.filter((_, index) => index !== removeIndex)
    );
  };

  return (

       <div className="gonna-eat-page">
     <Header />
            <div className="gonna-eat-content"> 
                <h2>What You Already Ate</h2>
                <button onClick={() => setShowSearch(true)} className="add-restaurant-button">+ Add a Restaurant</button>
                {showSearch && (
                    <SearchForRestaurant
                        onRestaurantSelect={handleSelectRestaurant}
                        onClose={() => setShowSearch(false)}
                    />    
                )}    
                
                <div className="restaurant-list">
                    {selectedRestaurants.map((restaurant, index) => (
                        <div className="mini-card" key={index}>
                            <h4>{restaurant.name}</h4>
                            <p>{restaurant.location}</p>

                            <button
                                className="remove-button"
                                onClick={(() => handleRemoveRestaurant(index))}
                                >
                                    Delete
                                </button>
                        </div>    
                    ))}
                </div>
            </div>            
    </div>  
  );
};

export default AlreadyAte;