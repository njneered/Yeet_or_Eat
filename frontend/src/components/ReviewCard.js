import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReviewCard.css';

const ReviewCard = ({ review, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (onDelete) onDelete(review.id);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(review);
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="user-info">
          <img
            src={review.profile_picture_url}
            alt={`${review.profile?.username || 'User'}'s avatar`}
            className="avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo-red.png';
            }}
          />
          <div>
            <p className="username">@{review.username}</p>
            <h3 className="review-title">{review.activity || review.title}</h3>
            <p className="timestamp">
              {new Date(review.timestamp).toLocaleString()}
            </p>
            {review.restaurant_name && (
              <p className="restaurant-name">{review.restaurant_name}</p>
            )}
          </div>
        </div>
        <div className="header-right">
          <span
            className={`privacy-badge ${
              review.privacy === 'Public'
                ? 'public'
                : review.privacy === 'Friends Only'
                ? 'friends'
                : 'private'
            }`}
          >
            {review.privacy === 'Private' ? 'My Eyes Only' : review.privacy}
          </span>
        </div>
      </div>

      <div className="review-text-content">
        <div className="emoji-spectrum">
          {[1, 2, 3, 4, 5].map((value) => (
            <span
              key={value}
              className={`emoji-option ${
                value <= Math.abs(review.rating) ? 'selected' : ''
              }`}
            >
              {review.rating > 0 ? '🔥' : '🤢'}
            </span>
          ))}
        </div>
        <p>{review.review_text}</p>

        {review.review_images?.length > 0 && (
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '0.5rem',
            marginTop: '0.5rem',
            paddingBottom: '0.5rem'
          }}>
            {review.review_images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Review ${index}`}
                style={{
                  height: '150px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            ))}
          </div>
        )}
      </div>



        {review.tags && review.tags.length > 0 && (
          <div className="tag-container" style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {review.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  background: '#f1f1f1',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="review-actions">
        {onDelete && (
          <button className="action-button" onClick={handleDelete}>
            Delete
          </button>
        )}
        {onEdit && (
          <button className="action-button" onClick={handleEdit}>
            Edit Review
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
