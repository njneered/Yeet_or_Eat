import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

    // Placeholder until restaurant linking is dynamic
    // MOCK RESTAURANT DATA FOR TESTING
    const mockRestaurant = {
        id: 42,
        name: 'Yeet Street Tacos',
        location: 'Gainesville, FL'
    };

const SubmitReview = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Form Fields
    const [activity, setActivity] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [privacy, setPrivacy] = useState('Friends Only');
    const [tags, setTags] = useState([]);
    const [emojiRating, setEmojiRating] = useState(0);
    const [ratingType, setRatingType] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [image, setImage] = useState(null);
    // Form Fields

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

  if (!user) return <p>! Log in to post a review !</p>;


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
            user_id: user.id, // ✅ Required by Supabase RLS
            username: user.username, // Optional but nice
            restaurant_id: mockRestaurant.id,
            restaurant_name: mockRestaurant.name,
            timestamp: new Date().toISOString()
        };

        const { error } = await supabase.from('reviews').insert([review]);

        if (error) {
            alert('Failed to submit review');
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
      <div className="submit-review">
        <h2>Submit a Review for {mockRestaurant.name} </h2>
        <p className="reviewer-info">Posting as <strong>@{user.username}</strong></p>
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
          image={image}
          setImage={setImage}
          onSubmit={handleSubmit}
          mode="submit"
        />
      </div>
    </>
  );
  // Render the form
};

export default SubmitReview;
