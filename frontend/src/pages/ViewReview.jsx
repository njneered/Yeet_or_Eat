import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../pages/SubmitReview.css';
import './ViewReview.css';

const tagOptions = ['🔥 Hot', 'Gluten-Free', '🤑 Dirt Cheap',
  '🌹 Romantic', '🆒 Trendy', 'Vegan', 'Vegetarian',
  '🎩 Fancy', '💸 Hope you had some money saved up', '🏆 Best Bathroom IYKYK',
  '🇮🇹 Nonna approves', '🇷🇺 Babushka approves'];

const ViewReview = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  


    const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles!user_id (
          username,
          avatar_url
        )
      `)
      .eq('review_id', id)
      .order('created_at', { ascending: true });

    if (error) console.error("Failed to fetch comments:", error);
    else {
      console.log("Fetched comments with profile join:", data);
      setComments(data);
    }
  };

  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
    else if (error) console.error("User fetch error:", error);
  };

    const handleDeleteComment = async (commentId) => {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) console.error("Delete failed:", error);
        else fetchComments();
    };

    const handleEditComment = (commentId) => {
        const comment = comments.find((c) => c.id === commentId);
        if (comment) {
            setEditCommentId(commentId);
            setNewComment(comment.content);
        }
    };


  useEffect(() => {
    const fetchReviewAndComments = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            profile:profiles!user_id (username),
            restaurant:restaurants!restaurant_id (
            name,
            address
            )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Failed to fetch review:", error);
      } else {
        setReview(data);
      }

      await fetchComments();
      setLoading(false);
    };

    fetchUser();
    fetchReviewAndComments();
  }, [id]);

  const handleSaveComment = async (commentId) => {
  const { error } = await supabase
    .from('comments')
    .update({ content: editedContent })
    .eq('id', commentId);

  if (error) {
    console.error('Failed to update comment:', error);
  } else {
    setEditingCommentId(null);
    setEditedContent('');
    fetchComments();
  }
};


const handleCommentSubmit = async (e) => {
  e.preventDefault();

  if (!newComment.trim()) return;

  if (editCommentId) {
    const { error } = await supabase
      .from('comments')
      .update({ content: newComment })
      .eq('id', editCommentId);

    if (error) console.error("Failed to update comment:", error);
    else {
      await fetchComments();
      setEditCommentId(null);
      setNewComment('');
    }
  } else {
    const { error } = await supabase.from('comments').insert([
      {
        content: newComment,
        user_id: currentUser.id,
        review_id: id,
      },
    ]);

    if (error) console.error("Failed to insert comment:", error);
    else {
      await fetchComments();
      setNewComment('');
    }
  }
};


  if (loading) return <p>Loading...</p>;
  if (!review) return <p>Review not found.</p>;

  const {
    profile = {},
    timestamp,
    activity,
    review_text,
    cuisine,
    privacy,
    tags = [],
    rating,
    review_images = [],
    restaurant = {}
  } = review;

  const ratingType = rating < 0 ? 'yeet' : 'eat';
  const emojiRating = Math.abs(rating);

  return (
    <>
    <Header />
    <div className="submit-review">
      <div className="restaurant-info">
        <h2>@{profile?.username || 'Unknown User'}</h2>
        <p>{timestamp ? new Date(timestamp).toLocaleString() : 'No date provided'}</p>
      </div>

        <hr style={{ margin: '1rem 0', width: '100%', borderColor: '#ccc' }} />

        {restaurant?.name && (
        <div
            style={{
                width: '100%',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                minHeight: '80px',
                marginTop: '0.5rem',
            }}
        >
            <h3 style={{ margin: 0 }}>{restaurant.name}</h3>
            {restaurant.address && (
            <p style={{ color: '#f44336', marginTop: '0.25rem', fontWeight: 'bold' }}>{`At ${restaurant.address}`}</p>
            )}
        </div>
        )}

      {activity && (
        <div className="form-row">
          <label>Activity</label>
          <input type="text" value={activity} readOnly />
        </div>
      )}

      {review_text && (
        <div className="form-row">
          <label>Description</label>
          <textarea value={review_text} readOnly />
        </div>
      )}

      {cuisine && (
        <div className="form-row">
          <label>Cuisine</label>
          <input type="text" value={cuisine} readOnly />
        </div>
      )}


      {Array.isArray(review_images) && review_images.length > 0 && (
          <div className="review-images-container">
            {review_images.map((img, idx) => (
              <div className="review-image-wrapper" key={idx}>
                <img
                  src={img}
                  alt={`review-${idx}`}
                  className="review-image"
                />
              </div>
            ))}
          </div>
)}

      {tags.length > 0 && (
        <div className="tags">
          <label>Tags:</label>
          <div className="tag-container-for-view">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag selected">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

    {ratingType && (
    <div className="rating-toggle">
        <label className="rating-question">Emoji Meter Rating</label>
        <div className="selected-rating">
        {ratingType === 'yeet' ? '🤢 Yeet' : '🔥 Eat'}
        </div>
    </div>
    )}


      {ratingType && (
        <div className="emoji-spectrum">
          {[1, 2, 3, 4, 5].map((value) => (
            <span
              key={value}
              className={`emoji-option ${value <= emojiRating ? 'selected' : ''}`}
              style={{ pointerEvents: 'none' }}
            >
              {ratingType === 'yeet' ? '🤢' : '🔥'}
            </span>
          ))}
        </div>
      )}

<div
  className="form-row"
  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
>
  <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Comments</h3>

  <div className="comment-section">
    {comments.map((c, idx) => (
      <div
        key={idx}
        style={{
            position: 'relative',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header: Avatar, Username, Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          {c.profile?.avatar_url && (
            <img
              src={c.profile.avatar_url}
              alt="avatar"
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '0.5rem',
              }}
            />
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong>@{c.profile?.username || 'Anonymous'}</strong>
            <small>
              {new Date(c.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </small>
          </div>
        </div>


        {/* Comment Content */}
        {editingCommentId === c.id ? (
        <>
            <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            key={idx}
            style={{
                position: 'relative',
                backgroundColor: '#f9f9f9',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem',
                width: '100%',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
            />
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
                onClick={() => handleSaveComment(c.id)}
                className="comment-action-button"
                style={{ marginRight: '0.5rem' }}
            >
                Save
            </button>
            <button
                onClick={() => {
                setEditingCommentId(null);
                setEditedContent('');
                }}
                className="comment-action-button cancel"
            >
                Cancel
            </button>
            </div>
        </>
        ) : (
        <>
            <p style={{ textAlign: 'center', margin: 0 }}>{c.content}</p>
        {currentUser?.id === c.user_id && (
        <div
            style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '0.5rem',
            }}
        >
            <button
            onClick={() => {
                setEditingCommentId(c.id);
                setEditedContent(c.content);
            }}
            className="comment-action-button"
            >
            Edit
            </button>
            <button
            onClick={() => handleDeleteComment(c.id)}
            className="comment-action-button delete"
            >
            Delete
            </button>
        </div>
        )}
        </>
        )}

      </div>
    ))}

    {/* Comment form */}
    <form
      onSubmit={handleCommentSubmit}
      style={{ width: '100%', maxWidth: '600px', margin: '2rem auto' }}
    >
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Leave a comment..."
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #ccc',
          resize: 'vertical',
          marginBottom: '0.5rem',
        }}
        required
      />
      <button type="submit" className="submit-button" style={{ width: '100%' }}>
        Post Comment
      </button>
    </form>
  </div>
</div>





    </div>
    </>
  );
};

export default ViewReview;
