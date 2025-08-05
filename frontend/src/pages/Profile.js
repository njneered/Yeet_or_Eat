import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './Profile.css';
import ReviewCard from '../components/ReviewCard';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showTop10, setShowTop10] = useState(false);
  const [showBoards, setShowBoards] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User fetch error:", userError);
        return;
      }

      // Fetch profile info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return;
      }

      setProfile(profileData);

      // Fetch reviews
      const { data: rawReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (reviewsError) {
        console.error("Review fetch error:", reviewsError.message);
        return;
      }

      const reviewsWithPics = rawReviews.map((review) => ({
        ...review,
        profile_picture_url: profileData.avatar_url || '/logo-red.png'
      }));

      setReviews(reviewsWithPics);
    };

    fetchProfileAndReviews();
  }, []);

  if (!profile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center'
      }}>
        <h1>Wait here bro... ⏲️</h1>
        <p>Loading ur profile...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
         <div className="avatar-circle-static">
            <img
              src={profile.avatar_url || 'logo-red.png'}
              alt="User avatar"
              className="avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
              }}
            />

          </div>
          <h2>{profile.username}</h2>
          {profile?.bio && <p className="bio-text"><em>{profile.bio}</em></p>}
          {profile?.location && <p className="location-text">📍 {profile.location}</p>}
          <p>Bento Boss since {new Date(profile.created_at).getFullYear()}</p>

          <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
          <button onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/user/${profile.username}`);}}>Share</button>
          {profile.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              style={{ backgroundColor: '#c00', color: 'white' }}
            >
              🛠 Go to Admin Panel
            </button>
          )}
        </div>

        {/* Reviews */}
        <div className="profile-reviews">
          <h3>Recent Reviews</h3>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Widgets */}
        <div className="profile-widgets">
          <div className="dropdown-box" onClick={() => setShowTop10(!showTop10)}>
            Top 10 List {showTop10 ? '▲' : '▼'}
          </div>
          {showTop10 && (
            <div className="dropdown-content">
              <p>Your top 10.</p>
            </div>
          )}

          <div className="dropdown-box" onClick={() => setShowBoards(!showBoards)}>
            Charcuterie Boards {showBoards ? '▲' : '▼'}
          </div>
          {showBoards && (
            <div className="dropdown-content">
              <p>Clubs that you've joined.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
