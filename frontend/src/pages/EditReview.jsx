import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import Header from '../components/Header';
import ReviewForm from '../components/ReviewForm';

const EditReview = () => {
  const { id } = useParams();  // Get review ID from route
  const navigate = useNavigate();

  // State to hold form values
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [privacy, setPrivacy] = useState('Friends Only');
  const [tags, setTags] = useState([]);
  const [emojiRating, setEmojiRating] = useState(0);
  const [ratingType, setRatingType] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [images, setImages] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  // State to hold form values

  // Load current user and existing review
  useEffect(() => {
    const fetchUserAndReview = async () => {
      //  Auth
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User fetch error:', userError);
        return;
      }

        // Get username from profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            setUser({ id: user.id, email: user.email, username: '' }); // fallback
        } else {
            setUser({ id: user.id, email: user.email, username: profile.username });
        }

      // Fetch existing review by ID
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();

        console.log('Fetched review:', reviewData); // 👀

      if (reviewError || !reviewData) {
        console.error('Review fetch error:', reviewError);
        return;
      }

      // Populate form fields
      setActivity(reviewData.activity || '');
      setReviewText(reviewData.review_text || '');
      setCuisine(reviewData.cuisine || '');
      setPrivacy(reviewData.privacy || 'Friends Only');
      setTags(reviewData.tags || []);
      setEmojiRating(Math.abs(reviewData.rating) || 0);
      const type = reviewData.rating < 0 ? 'yeet' : 'eat';
      setRatingType(type);
      setSelectedType(type);
      setRestaurantName(reviewData.restaurant_name || '');
      if (reviewData.review_images?.length) {
        const formattedImages = reviewData.review_images.map((url) => ({
          preview: url,
          file: null,
        }));
        setImages(formattedImages);
      }
      setLoading(false);
    };

    fetchUserAndReview();
  }, [id]);

  if (loading) return <p>Loading review...</p>;


// Handle update submit
const handleUpdate = async (review) => {

if ( !review.review_text.trim() && !review.activity.trim() ) 
    {
    alert("You can't save an empty review.");
    return;
    }
    
  const { error } = await supabase
    .from('reviews')
    .update(review)
    .eq('id', id);



  if (error) {
    alert('Failed to update review');
    console.error(error);
  } else {
    alert('Review updated!');
    navigate('/my-reviews');
  }
};

  // Render the form
  return (
    <>
      <Header />
      <div className="submit-review">
        <h2>Edit Your Review for {restaurantName || 'this place'}</h2>
        <p className="reviewer-info">Editing as <strong>@{user.username}</strong></p>

        <ReviewForm
          activity={activity}
          setActivity={setActivity}
          reviewText={reviewText}
          setReviewText={setReviewText}
          cuisine={cuisine}
          setCuisine={setCuisine}
          privacy={privacy}
          setPrivacy={setPrivacy}
          tags={tags}
          setTags={setTags}
          emojiRating={emojiRating}
          setEmojiRating={setEmojiRating}
          ratingType={ratingType}
          setRatingType={setRatingType}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          images={images}
          setImages={setImages}
          onSubmit={handleUpdate}
          mode="edit"
        />
      </div>
    </>
  );
  // Render the form
};

export default EditReview;
