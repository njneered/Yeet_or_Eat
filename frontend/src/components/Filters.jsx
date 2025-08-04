// Filters.jsx
import React, { useState, useEffect } from 'react';
import "./Filters.css";

const ReviewFilters = ({ users, restaurants, tags, onFilterChange }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [hasPicture, setHasPicture] = useState(false);

  useEffect(() => {
    onFilterChange({
      user: selectedUser,
      restaurant: selectedRestaurant,
      tag: selectedTag,
      hasPicture,
    });
  }, [selectedUser, selectedRestaurant, selectedTag, hasPicture, onFilterChange]);

  return (
    <div
      className="review-filters"
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
        margin: '1rem 0',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="user-select" style={{ fontWeight: 'bold' }}>User</label>
        <select
          id="user-select"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="restaurant-select" style={{ fontWeight: 'bold' }}>Restaurant</label>
        <select
          id="restaurant-select"
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
        >
          <option value="">All Restaurants</option>
          {restaurants.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="tag-select" style={{ fontWeight: 'bold' }}>Tag</label>
        <select
          id="tag-select"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '13px' }}>
        <label htmlFor="has-picture-toggle" style={{ fontWeight: 'bold', marginBottom: '0.4rem' }}>
          Picture
        </label>
        <div style={{ display: 'flex', alignItems: 'center', height: '2.875rem' }}>
          <button
            id="has-picture-toggle"
            className="emoji-toggle"
            onClick={() => setHasPicture(!hasPicture)}
            title="Filter reviews with images"
          >
            <span
              style={{
                fontSize: '2.5rem',
                filter: hasPicture ? 'none' : 'grayscale(90%) brightness(30%)',
                transition: 'filter 0.2s ease',
              }}
            >
              📷
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;
