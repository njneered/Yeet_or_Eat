import Header from '../components/Header';
import React, { useEffect, useState, useRef } from 'react';
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
  const fileInputRef = useRef(null);

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

    // Fetch their reviews
    const { data: rawReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (reviewsError) {
      console.error("Review fetch error:", reviewsError.message);
      return;
    }

    // Attach profile picture URL to each review
       const reviewsWithPics = rawReviews.map((review) => {
          const filePath = profileData.avatar_url;
          let profile_picture_url = '/logo-red.png';
          console.log("Checking avatar path for user:", profile?.username, filePath, profile_picture_url);


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

  console.log("Uploading file to:", filePath);
  console.log("Profile ID being used:", profile?.id);

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
  const { data: urlData, error: urlError } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (urlError) {
    console.error('Failed to get public URL:', urlError.message);
    return;
  }

  const publicUrl = urlData.publicUrl;
  console.log("Public URL generated:", publicUrl);

  // update avatar to profiles table
  const { error: updateError,} = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Profile update failed:', updateError.message);
    return;
  }

  console.log("Updating avatar for user ID:", profile.id);
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
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Dropdowns */}
        <div className="profile-widgets">
          <div className="dropdown-box" onClick={() => setShowTop10(!showTop10)}>
             Top 10 List {showTop10 ? '▲' : '▼'}
          </div>
          {showTop10 && (
            <div className="dropdown-content">
              <p>Their top 10.</p>
            </div>
          )}

          <div className="dropdown-box" onClick={() => setShowBoards(!showBoards)}>
             Charcuterie Boards {showBoards ? '▲' : '▼'}
          </div>
          {showBoards && (
            <div className="dropdown-content">
              <p>Clubs that the they've joined.</p>
            </div>
          )}
        </div>
      </div>
    </>  
  );

};





export default Profile;