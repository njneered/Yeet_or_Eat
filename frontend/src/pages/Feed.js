import React, { useEffect, useState } from "react";
import Header from '../components/Header';
import supabase from '../supabaseClient';
import './Feed.css';
import ReviewCard from "../components/ReviewCard";
import ReviewFilters from "../components/Filters";

const Feed = () => {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState(null);
  const users = [...new Set(reviews.map(r => r.profile?.username).filter(Boolean))];
  const restaurants = [...new Set(reviews.map(r => r.restaurant_name).filter(Boolean))];
  const tags = [...new Set(reviews.flatMap(r => r.tags || []))];

  const filteredReviews = filters
  ? reviews.filter((review) => {
      const matchesUser = !filters.user || review.profile?.username === filters.user;
      const matchesRestaurant = !filters.restaurant || review.restaurant_name === filters.restaurant;
      const matchesTag = !filters.tag || review.tags?.includes(filters.tag);
      const matchesPicture = !filters.hasPicture || Boolean(review.image_url);

      return matchesUser && matchesRestaurant && matchesTag && matchesPicture;
    })
  : reviews;


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

      if (error) {
        console.error(error);
      } else {
        const reviewsWithPics = data.map((review) => {
          const filePath = review.profile?.avatar_url;
          let profile_picture_url = '/logo-red.png';

          if (filePath && !filePath.startsWith('http')) {
            const { data: publicData, error: urlError } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(filePath);

            if (!urlError && publicData?.publicUrl) {
              profile_picture_url = publicData.publicUrl;
            }
          } else if (filePath) {
            profile_picture_url = filePath;
          }

          return {
            ...review,
            profile_picture_url,
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
        <h2>My Feed</h2>

        <ReviewFilters
          users={users}
          restaurants={restaurants}
          tags={tags}
          onFilterChange={setFilters}
        />

        {filteredReviews.length === 0 ? (
          <p style={{ color: '#888', marginTop: '1rem' }}>No reviews match your filters.</p>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Feed;