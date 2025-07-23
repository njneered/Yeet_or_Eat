import Header from '../components/Header';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { useRef } from 'react';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      const {data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

      const { data: userReviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false});

      setProfile(profileData);
      setReviews(userReviews || []); // fallback to empty array bc it keeps crashing
      // it just ensures that if userReviews is null, it becomes [] to prevent .map() from crashing
    };

    fetchProfileAndReviews();
  }, []);


  const handleAvatarClick = () => {
  fileInputRef.current.click();
};

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.log("No file selected");
    return;
  }

  console.log("Selected file:", file);

  const fileExt = file.name.split('.').pop();
  const fileName = `${profile.id}.${fileExt}`;
  const filePath = fileName; 

  // upload to supabase storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Upload failed:', uploadError.message);
    return;
  }
  console.log("Upload successful:", uploadData)

  // get public url
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = data.publicUrl;
  console.log("Public URL:", publicUrl);

  // update avatar to profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Profile update failed:', updateError.message);
    return;
  }
  console.log("Profile updated with new avatar URL");

  // changes reflect in ui
  setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
};


  if (!profile) return (
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




  return (
    <>
      <Header />

      <div className = "profile-page">
        <div className = "profile-header">
          <div className="avatar-circle" onClick={handleAvatarClick}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="avatar-img" />
            ) : (
              <span className="plus-icon">+</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <h2>{profile.username}</h2>
          <p>{profile.location}</p>
          <p>{profile.bio}</p>
          <p>Bento Boss since {new Date(profile.created_at).getFullYear()}</p>
          <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)}>Share</button>
        </div>

        {/*Recent Activities*/}
        <div className="profile-reviews">
          <h3>Recent Reviews</h3>
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <p>{review.review_text}</p>
              {review.image_urls?.length > 0 && (
                <img
                  src={review.image_urls[0]}
                  alt="activity"
                  className="review-img"
                  onClick={() => navigate(`/review/${review.id}`)}
                />
              )}
            </div>  
          ))}
        </div>

        {/*Placeholders for upcoming feautres*/}
        <div className="profile-widgets">
          <div className="top-10-list">🔥 Top 10 List (coming soon)</div>
          <div className="charcuterie-boards">🧀 Charcuterie Boards (coming soon)</div>
        </div>

      </div>
    </>  
  );

};





export default Profile;