import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import ReviewCard from '../components/ReviewCard';
import Header from '../components/Header';
import './Profile.css';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        setNotFound(true);
        return;
      }

      // Resolve avatar URL
      let avatarUrl = '/logo-red.png';
      const filePath = profileData.avatar_url;
      if (filePath && !filePath.startsWith('http')) {
        const { data: publicData, error: urlError } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (!urlError) {
          avatarUrl = publicData?.publicUrl || avatarUrl;
        }
      } else if (filePath && filePath.startsWith('http')) {
        avatarUrl = filePath;
      }

      // Set profile with resolved avatar
      setProfile({ ...profileData, avatar_url: avatarUrl });

      // Fetch public reviews
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('privacy', 'Everyone')
        .order('timestamp', { ascending: false });

      if (!reviewError) {
        const reviewsWithAvatar = reviewData.map(r => ({
          ...r,
          profile_picture_url: avatarUrl
        }));
        setReviews(reviewsWithAvatar);
      }
    };

    fetchData();
  }, [username]);

  if (notFound) {
    return (
      <>
        <Header />
        <div style={{
          textAlign: 'center',
          marginTop: '100px',
          fontFamily: 'Fredoka, sans-serif'
        }}>
          <h1>😕 User not found</h1>
          <p>The profile <strong>@{username}</strong> does not exist.</p>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h1>Loading user profile...</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <div className="avatar-circle-static">
            <img src={profile.avatar_url} alt="avatar" className="avatar-img" />
          </div>
          <h2>{profile.username}</h2>
          {profile.bio && <p className="bio-text"><em>{profile.bio}</em></p>}
          {profile.location && <p className="location-text">📍 {profile.location}</p>}
          <p>Bento Boss since {new Date(profile.created_at).getFullYear()}</p>
        </div>

        <div className="profile-reviews">
          <h3>Recent Public Reviews</h3>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <p>This user hasn't posted public reviews yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
