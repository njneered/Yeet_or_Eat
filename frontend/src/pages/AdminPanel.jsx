import React, { useEffect, useState, useCallback } from 'react';
import supabase from '../supabaseClient';
import ReviewCard from '../components/ReviewCard';
import ReviewFilters from '../components/Filters';
import Header from '../components/Header';

const AdminPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert('Not logged in');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        alert("You are not authorized to view this page.");
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isAdmin) return;

      const { data: allReviews, error: reviewError } = await supabase
        .from('reviews')
        .select(`*, profile:profiles!user_id(username, avatar_url)`)
        .order('timestamp', { ascending: false });

      if (reviewError || !allReviews) {
        console.error("Failed to fetch reviews:", reviewError);
        return;
      }

      const reviewsWithAvatars = await Promise.all(
        allReviews.map(async (review) => {
          let profile_picture_url = '/logo-red.png'; // fallback image
          const avatarPath = review.profile?.avatar_url;

          if (avatarPath && typeof avatarPath === 'string') {
            if (avatarPath.startsWith('http')) {
              profile_picture_url = avatarPath;
            } else {
              const { data: avatarData } = supabase.storage
                .from('avatars')
                .getPublicUrl(avatarPath);
              if (avatarData?.publicUrl) {
                profile_picture_url = avatarData.publicUrl;
              }
            }
          }

          return {
            ...review,
            profile_picture_url,
          };
        })
      );

      setReviews(reviewsWithAvatars);
      setLoading(false);
    };

    fetchReviews();
  }, [isAdmin]);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredReviews = filters
    ? reviews.filter((review) => {
        const matchesUser = !filters.user || review.profile?.username === filters.user;
        const matchesRestaurant = !filters.restaurant || review.restaurant_name === filters.restaurant;
        const matchesTag = !filters.tag || review.tags?.includes(filters.tag);
        const matchesPicture = !filters.hasPicture || Boolean(review.image_url);
        return matchesUser && matchesRestaurant && matchesTag && matchesPicture;
      })
    : reviews;

  const users = [...new Set(reviews.map(r => r.profile?.username).filter(Boolean))];
  const restaurants = [...new Set(reviews.map(r => r.restaurant_name).filter(Boolean))];
  const tags = [...new Set(reviews.flatMap(r => r.tags || []))];

  if (loading) return <p>Loading admin data...</p>;
  if (!isAdmin) return <p>Access denied</p>;

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
        <h2>🛠️ Admin Panel – All Reviews</h2>

        <ReviewFilters
          users={users}
          restaurants={restaurants}
          tags={tags}
          onFilterChange={handleFilterChange}
        />

        {filteredReviews.length === 0 ? (
          <p style={{ color: '#888', marginTop: '1rem' }}>No reviews match your filters.</p>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => handleDelete(review.id)}
            />
          ))
        )}
      </div>
    </>
  );
};

export default AdminPanel;
