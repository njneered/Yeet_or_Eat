import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './MyReviews.css';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';

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
        const reviewsWithPics = data.map((review) => {
          if (review.profile_picture) {
            const { data: publicData } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(review.profile_picture);

            return {
              ...review,
              profile_picture_url: publicData?.publicUrl || '/logo-red.png'
            };
          } else {
            return {
              ...review,
              profile_picture_url: '/logo-red.png'
            };
          }
        });

        setReviews(reviewsWithPics);
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

  //  Redirect to edit review page
  const handleEdit = (review) => {
    navigate(`/edit/${review.id}`);
  };



  // Render the reviews
  return (
    <>
      <Header />
      <div className="my-reviews">
        <h2>My Reviews</h2>
        {!isLoggedIn ? (
          <p>You need to be logged in to see your stored reviews.</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </>
  );
};

export default MyReviews;
