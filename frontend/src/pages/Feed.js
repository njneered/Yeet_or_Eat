import React, { useEffect, useState } from "react";
import Header from '../components/Header';
import supabase from '../supabaseClient';
import './Feed.css';


const Feed =() => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error} = await supabase
      .from('reviews')
      .select('*')
      .order('timestamp', {ascending: false});

      if (!error) setReviews(data);
      else console.error(error);
    };

    fetchReviews();
  }, []);

  return (
    <>
      <Header />
      <div className="feed-container">
        <h2>Welcome to Your Feed!</h2>
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <h3>{review.restaurant_name}</h3>
              <p><strong>@{review.username}</strong></p>
              <p>{review.review_text}</p>
              <p className="timestamp">{new Date(review.timestamp).toLocaleString()}</p>
            </div>
          ))}
      </div>    
    </>
  );
};

export default Feed;