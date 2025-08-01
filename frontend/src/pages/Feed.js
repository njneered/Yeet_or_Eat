import React, { useEffect, useState } from "react";
import Header from '../components/Header';
import supabase from '../supabaseClient';
import './Feed.css';
import ReviewCard from "../components/ReviewCard";

const Feed = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        const reviewsWithPics = data.map((review) => {
          const { data: publicData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(review.profile_picture);

          return {
            ...review,
            profile_picture_url: publicData?.publicUrl || '/logo-red.png'
          };
        });

        setReviews(reviewsWithPics);
      }
    };

    fetchReviews();
  }, []);

  return (
    <>
      <Header />
      <div className="feed-container">
        <h2>Welcome to Your Feed!</h2>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            // No edit/delete in feed, so don’t pass onDelete/onEdit
          />
        ))}
      </div>
    </>
  );
};

export default Feed;