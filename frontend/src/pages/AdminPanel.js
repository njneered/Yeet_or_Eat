import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';

const AdminPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminContent = async () => {
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

      const { data: allReviews, error: reviewError } = await supabase
        .from('reviews')
        .select(`*, profile:profiles!user_id(username, avatar_url)`)
        .order('timestamp', { ascending: false });

      if (!reviewError) setReviews(allReviews);
      setLoading(false);
    };

    loadAdminContent();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  if (loading) return <p>Loading admin data...</p>;
  if (!isAdmin) return <p>Access denied</p>;

  return (
    <>
      <Header />
      <div className="admin-panel">
        <h2>🛠️ Admin Panel – All Reviews</h2>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onDelete={() => handleDelete(review.id)}
          />
        ))}
      </div>
    </>
  );
};

export default AdminPanel;
