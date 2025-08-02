import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import SearchForRestaurant from '../components/SearchForRestaurant';
import './SubmitReview.css';


const SubmitReview = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // restaurant state
    const [restaurantSelected, setRestaurantSelected] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    // Form Fields
    const [activity, setActivity] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [privacy, setPrivacy] = useState('Friends Only');
    const [tags, setTags] = useState([]);
    const [emojiRating, setEmojiRating] = useState(0);
    const [ratingType, setRatingType] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [images, setImages] = useState([]);

  // loading user from supabase
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      setUser({ ...user, username: profile?.username });
    };
    loadUser();
  }, []);

  // if user is not logged in
  if (!user) {
    return (
      <div className="unauth-container">
        <h1>Bro did you log in? 🤨</h1>
        <p>Press the back button to get it together.</p>
      </div>
    );
  }


  // Insert new review into Supabase
    const handleSubmit = async (partialReview) => {
        if (!user) {
            alert("You must be logged in.");
            return;
        }
          // Check for empty review fields
        if (
            !partialReview.review_text.trim() &&
            !partialReview.activity.trim()
        ) {
            alert("Review must include a description or activity.");
            return;
        }


        const review = {
            ...partialReview,
            user_id: user.id, 
            username: user.username, // Optional but nice
            restaurant_id: selectedRestaurant.id,
            restaurant_name: selectedRestaurant.name,
            restaurant_address: selectedRestaurant?.address || '',
            timestamp: new Date().toISOString()
        };

        const { error } = await supabase.from('reviews').insert([review]);

        if (error) {
            alert('Something went wrong dawg. Failed to submit review');
            console.error(error);
        } else {
            alert('Review submitted!');
            navigate('/my-reviews');
        }
    };

  // Render the form
  return (
    <>
      <Header />

      {/* Overlay shown until restaurant is selected */}
      {!restaurantSelected && (
        <>
          <p className="reviewer-info">
          </p>
        <div className="overlay-center">
          <SearchForRestaurant
            onRestaurantSelect={(restaurant) => {
              setSelectedRestaurant(restaurant);
              setRestaurantSelected(true);
            }}
          />
        </div>
        </>
      )}

      {/* Review form - blurred if no restaurant selected */}
      <div className="submit-review-container">
        <div className={`submit-review ${!restaurantSelected ? 'blurred' : ''}`}>
          <p className="reviewer-info">
            <strong>@{user.username}</strong>
          </p>
          {selectedRestaurant && (
            <div className="restaurant-info">
              <h2>Submit a Review for {selectedRestaurant.name}</h2>
              <p> At {selectedRestaurant.address || `${selectedRestaurant.location?.street}, ${selectedRestaurant.location?.city}`}
              </p>
            </div>
          )}


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
            onSubmit={handleSubmit}
            mode="submit"
          />
        </div>
      </div>

    </>
  );
};

export default SubmitReview;
