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
          .select(`
          *,
          profile:profiles!user_id (
            avatar_url,
            username
          )
        `)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Review fetch error:', error.message);

      } else {
       const reviewsWithPics = data.map((review) => {
          const filePath = review.profile?.avatar_url;
          let profile_picture_url = '/logo-red.png';
          console.log("Checking avatar path for user:", review.profile?.username, filePath, profile_picture_url);


          if (filePath && !filePath.startsWith('http')) {
            // Only get public URL if it's not already a full URL
            const { data: publicData, error: urlError } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(filePath);

            if (urlError) {
              console.error("Error fetching public avatar URL:", urlError);
            } else {
              profile_picture_url = publicData?.publicUrl;
            }
          } else if (filePath && filePath.startsWith('http')) {
            // Already a full URL, just use it
            profile_picture_url = filePath;
          }

          return {
            ...review,
            profile_picture_url
          };
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
