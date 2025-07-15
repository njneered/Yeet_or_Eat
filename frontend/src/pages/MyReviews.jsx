import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import './MyReviews.css';
import Header from '../components/Header';


const MyReviews = () => {


    const [editingReview, setEditingReview] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [editedRating, setEditedRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [userId, setUserId] = useState(null);

    const handleEditStart = (review) => {
        setEditingReview(review.id);
        setEditedText(review.review_text);
        setEditedRating(review.rating);
    };

  useEffect(() => {
    const fetchReviews = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User fetch error:', userError);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Review fetch error:', error.message);
      } else {
        setReviews(data);
      }
    };

    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      alert('Failed to delete review.');
    } else {
      setReviews(reviews.filter((review) => review.id !== id));
    }
  };

  const handleSaveEdit = async (id) => {
  const { error } = await supabase
    .from('reviews')
    .update({ review_text: editedText, rating: editedRating })
    .eq('id', id);

  if (error) {
    alert('Failed to save changes.');
    console.error(error);
  } else {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, review_text: editedText, rating: editedRating } : r))
    );
    setEditingReview(null);
  }
};

const handleEditRating = (id, newRating) => {
  const current = reviews.find((r) => r.id === id);
  if (!current) return;

  const isYeet = current.rating < 0;
  const adjustedRating = isYeet ? -newRating : newRating;

  setEditedRating(adjustedRating);
};

  return (
    <>
    <Header />
    <div className="my-reviews">
      <h2>My Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet :(</p>
      ) : (
        reviews.map((review) => ( // Review Editing Section
          <div key={review.id} className="review-card">
            <h3>{review.restaurant_name}</h3>
            <div className="emoji-spectrum">
            {[1, 2, 3, 4, 5].map((value) => (
                <span
                key={value}
                className={`emoji-option ${value <= Math.abs(editingReview === review.id ? editedRating : review.rating) ? 'selected' : ''}`}
                onClick={() => handleEditRating(review.id, value)}
                >
                {(editingReview === review.id ? editedRating : review.rating) > 0 ? '🔥' : '🤢'}
                </span>
            ))}
            </div>
            {editingReview === review.id ? (
            <>
                <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px' }}
                />
                <button className="save-button" onClick={() => handleSaveEdit(review.id)}>💾 Save</button>
                <button className="cancel-button" onClick={() => setEditingReview(null)}>❌ Cancel</button>
            </>
            ) : (
            <>
                <p>{review.review_text}</p>
                <button onClick={() => handleDelete(review.id)}>🗑 Delete</button>
                <button className="edit-button" onClick={() => handleEditStart(review)}>✏️ Edit Review</button>
            </>
            )}
          </div>
        )) // End of reviews mapping
      )}
    </div>
    </>
  );
};

export default MyReviews;
