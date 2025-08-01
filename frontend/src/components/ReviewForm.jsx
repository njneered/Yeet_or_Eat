import React, { useEffect, useState } from 'react';
import '../pages/SubmitReview.css';

const submitReviewButton = new Audio('/vine-boom.mp3');
submitReviewButton.volume = 0.5;

//  Suggested tags for user to select
const tagOptions = ['🔥 Hot', 'Gluten-Free', '🤑 Dirt Cheap',
  '🌹 Romantic', '🆒 Trendy', 'Vegan', 'Vegetarian',
  '🎩 Fancy', '💸 Hope you had some money saved up', '🏆 Best Bathroom IYKYK',
  '🇮🇹 Nonna approves', '🇷🇺 Babushka approves'];
//  Suggested tags for user to select

//  Allows this to work in both submit/edit modes
const ReviewForm = ({
  activity, setActivity,
  reviewText, setReviewText,
  cuisine, setCuisine,
  privacy, setPrivacy,
  tags = [], setTags,
  emojiRating, setEmojiRating,
  ratingType, setRatingType,
  selectedType, setSelectedType,
  onSubmit,
  mode = 'submit',
}) => {
// Allows this to work in both submit/edit modes
const [images, setImages] = useState([]);
  // One-time population of edit values
  useEffect(() => {
    if (mode === 'edit') {
      setActivity((prev) => prev || activity);
      setReviewText((prev) => prev || reviewText);
      setCuisine((prev) => prev || cuisine);
      setPrivacy((prev) => prev || privacy);
      setTags((prev) => prev.length ? prev : tags);
      setEmojiRating((prev) => prev || emojiRating);
      const type = ratingType || (emojiRating < 0 ? 'yeet' : 'eat');
      setRatingType(type);
      setSelectedType(type);
    }
  }, []);
  // One-time population of edit values

  // Handles toggling Yeet/Eat and emoji reset
  const handleSelect = (type) => {
    setSelectedType(type);
    setRatingType(type);
    setEmojiRating(0); // Reset on toggle
  };
  // Handles toggling Yeet/Eat and emoji reset

  // Toggles tags on/off
  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  // Toggles tags on/off

  // Handles image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...previewUrls]);
  };


  // Trigger parent submission with compiled review data
  const handleSubmit = (e) => {
    e.preventDefault();
    const compiled = {
      activity,
      review_text: reviewText,
      cuisine,
      privacy,
      tags,
      rating: ratingType === 'yeet' ? -emojiRating : emojiRating,
    };
    onSubmit(compiled);
  };

  // Render the form
  return (
    <form onSubmit={handleSubmit}>
      <label>Add Activity</label>
      <input type="text" placeholder="Describe this meal in 7 words or less..." value={activity} onChange={(e) => setActivity(e.target.value)} />

      <label>Description</label>
      <textarea placeholder = "How was the food? Describe this meal's feels, and use @ to tag someone." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />

      <label>Cuisine</label>
      <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
        <option value="">What race was your food? 🌎 </option>
        <option value="American">🇺🇸 American 🍔</option>
        <option value="Brazilian">🇧🇷 Brazilian 🥩</option>
        <option value="Caribbean">🏝️ Caribbean 🍤</option>
        <option value="Chinese">🇨🇳 Chinese 🥡</option>
        <option value="Ethiopian">🇪🇹 Ethiopian 🍛</option>
        <option value="French">🇫🇷 French 🥖</option>
        <option value="Greek">🇬🇷 Greek 🥙</option>
        <option value="Indian">🇮🇳 Indian 🍛</option>
        <option value="Italian">🇮🇹 Italian 🍝</option>
        <option value="Jamaican">🇯🇲 Jamaican 🌶️</option>
        <option value="Japanese">🇯🇵 Japanese 🍣</option>
        <option value="Korean">🇰🇷 Korean 🍜</option>
        <option value="Lebanese">🇱🇧 Lebanese 🧆</option>
        <option value="Mediterranean">🌍 Mediterranean 🫒</option>
        <option value="Mexican">🇲🇽 Mexican 🌮</option>
        <option value="Middle Eastern">🌍 Middle Eastern 🍢</option>
        <option value="Peruvian">🇵🇪 Peruvian 🥘</option>
        <option value="Spanish">🇪🇸 Spanish 🥘</option>
        <option value="Thai">🇹🇭 Thai 🍲</option>
        <option value="Vietnamese">🇻🇳 Vietnamese 🍜</option>
      </select>

      <label>Who Can View?</label>
      <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
        <option value="Friends Only">👯 Friends Only</option>
        <option value="Everyone">🌍 Everyone</option>
        <option value="My Eyes Only">🙈 My Eyes Only</option>
      </select>

      <div className="upload-section">
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />


        <div
          className="upload-box"
          onClick={() => document.getElementById('imageInput').click()}
        >
        {images.length > 0 ? (
          images.map((src, idx) => (
            <img key={idx} src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ))
        ) : (
          <p>+<br />Prove you actually ate here!</p>
        )}
        </div>
      </div>



      <div className="tags">
        <label>Tags:</label>
        {tagOptions.map((tag) => (
          <button
            key={tag}
            type="button"
            className={tags.includes(tag) ? 'tag selected' : 'tag'}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="rating-toggle">
        <label className="rating-question">Emoji Meter Rating</label>
        <div className="rating-options">
          <button
            type="button"
            className={`option-button ${selectedType === 'yeet' ? 'selected' : ''}`}
            onClick={() => handleSelect('yeet')}
          >
            🤢 Yeet
          </button>
          <button
            type="button"
            className={`option-button ${selectedType === 'eat' ? 'selected' : ''}`}
            onClick={() => handleSelect('eat')}
          >
            🔥 Eat
          </button>
        </div>
      </div>

      {ratingType && (
        <div className="emoji-spectrum">
          {[1, 2, 3, 4, 5].map((value) => (
            <span
              key={value}
              className={`emoji-option ${value <= emojiRating ? 'selected' : ''}`}
              onClick={() => setEmojiRating(value)}
            >
              {ratingType === 'yeet' ? '🤢' : '🔥'}
            </span>
          ))}
        </div>
      )}

      <button type="submit" className="submit-button" onClick={(e) => { e.preventDefault(); submitReviewButton.currentTime =0; submitReviewButton.play();
              setTimeout(() => {
                e.target.form.requestSubmit();
              }, 300);
      }}>
        {mode === 'edit' ? '💾 Save Changes' : '🍽️ Submit Review'}
      </button>
    </form>
  );
  // Render the form
};

export default ReviewForm;
