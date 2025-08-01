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
          .select(`
            *,
            profile:profiles!user_id (
              username,
              avatar_url
            )
          `)
        .order('timestamp', { ascending: false });

      console.log("Raw reviews:", data);
      if (error) {
        console.error(error);

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