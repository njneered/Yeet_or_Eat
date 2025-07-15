import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './MyReviews.css';
import Header from '../components/Header';

const MyReviews = () => {
  // Local state to track reviews and the user ID
  const [reviews, setReviews] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  // Fetch the current user and their reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User fetch error:', userError);
        setIsLoggedIn(false);
        return;
      }

      setUserId(user.id);
      setIsLoggedIn(true);

      // Fetch reviews belonging to the user
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

  // Handle review deletion
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete review:', error);
      alert('Delete failed.');
    } else {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };
  // Handle review deletion

  //  Redirect to edit review page
  const handleEdit = (review) => {
    navigate(`/edit/${review.id}`);
  };
  //  Redirect to edit review page

  // Render the reviews
  return (
    <>
      <Header />
      <div className="my-reviews">
        <h2>My Reviews</h2>
        {!isLoggedIn ? (
          <p>You need to be logged in to see your stored reviews.</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet :(</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <h3>{review.restaurant_name}</h3>
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
              <div className="review-actions">
              <button className="action-button" onClick={() => handleDelete(review.id)}> 🗑 Delete </button>
              <button className="action-button" onClick={() => handleEdit(review)}> ✏️ Edit Review </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
  // Render the reviews
};

export default MyReviews;
