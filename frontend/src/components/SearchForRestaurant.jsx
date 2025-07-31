import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import './SearchForRestaurant.css';

const SearchForRestaurant = ({ onRestaurantSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (query.length > 1){
                searchYelp(query);
            }
            else{
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [query]);


    const searchYelp = async (term) => {
    setIsLoading(true);
    console.log('Searching for:', term);

    try {
        const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${term}%`)// case-insensitive LIKE search
        .limit(10);

        if (error) throw error;

        setResults(data || []);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setQuery(restaurant.name);
        setResults([]);
    };

    const handleConfirm = () => {
        if (selectedRestaurant) {
            onRestaurantSelect(selectedRestaurant);
        }
    };

    return (
        <div className = "search-container">
            <h2>Search for a restaurant to review...</h2>
            <div className="search-row">
                <input
                type="text"
                placeholder="Search restaurants..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedRestaurant(null);
                }}
                className="search-input"
                />

                {selectedRestaurant && (
                <button
                className="clear-button"
                onClick={() => {
                    setSelectedRestaurant(null);
                    setQuery('');
                    setResults([]);
                }}
                >
                    x
                </button>
                )}

                  <button
                    className={`write-button ${!selectedRestaurant ? 'disabled' : ''}`}
                    onClick={handleConfirm}
                    disabled={!selectedRestaurant}
                >
                    Select
                </button>
            </div>



            {isLoading && <p>Searching...</p>}

            {results.length > 0 && (
                <ul className="search-results">
                    {results.map((r) => (
                        <li key={r.id} onClick={() => handleSelect(r)}>
                            <strong>{r.name}</strong>
                            <br />
                            <span style={{ fontSize: '0.9rem', color: '#555' }}>
                            {r.address || `${r.location?.street}, ${r.location?.city}`}
                            </span>
                        </li>
                        ))}

                </ul>
            )}

        </div>
    );
};

export default SearchForRestaurant;