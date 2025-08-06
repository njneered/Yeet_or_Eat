import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './EditProfile.css';
import Header from '../components/Header';

const EditProfile = () => {
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('bio, location, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setBio(data.bio || '');
        setLocation(data.location || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ bio, location, avatar_url: avatarUrl})
      .eq('id', userId);

    if (!error) {
      navigate('/profile');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload failed:', uploadError.message);
      return;
    }

    const { data: urlData, error: urlError } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (urlError) {
      console.error('Failed to get public URL:', urlError.message);
      return;
    }

    const publicUrl = urlData.publicUrl;
    setAvatarUrl(publicUrl);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update profile with avatar:', updateError.message);
    }
  };

  return (
    <>
      <Header />
      <div className="edit-profile-container">
        <h1>🧑‍🍳 Customize Your Bento Identity</h1>
        <p className="subtitle">Your face, your flavor 🍱</p>

        <div className="avatar-wrapper">
          <div className="avatar-upload-section" onClick={handleAvatarClick}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="avatar-img-preview" />
            ) : (
              <div className="avatar-placeholder">+</div>
            )}
          </div>

          {avatarUrl && (
            <button
              className="remove-avatar-btn"
              onClick={async () => {
                setAvatarUrl('');
                const { error } = await supabase
                  .from('profiles')
                  .update({ avatar_url: null })
                  .eq('id', userId);
                if (error) console.error('Failed to remove avatar:', error.message);
              }}
            >
              🗑 Remove Avatar
            </button>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="edit-form">
          <label>
            📝 Bio:
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your foodie self..."
              maxLength={300}
            />
          </label>

          <label>
            📍 Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              maxLength={100}
            />
          </label>

          <button className="save-btn" onClick={handleSave}>
            💾 Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
