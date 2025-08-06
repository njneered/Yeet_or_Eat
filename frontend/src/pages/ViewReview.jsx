// ViewReview.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../pages/SubmitReview.css';
import './ViewReview.css';

const DEFAULT_AVATAR = '/logo-red.png';

const ViewReview = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [mainComment, setMainComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);

  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
    else if (error) console.error("User fetch error:", error);
  };

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

    if (error) {
      console.error("Failed to fetch comments:", error);
      return;
    }

    const topLevel = data.filter(c => !c.parent_comment_id);
    const replies = data.filter(c => c.parent_comment_id);

    const nested = topLevel.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_comment_id === c.id)
    }));

    setComments(nested);
  };

  useEffect(() => {
    const fetchReviewAndComments = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profile:profiles!user_id (username),
          restaurant:restaurants!restaurant_id (name, address)
        `)
        .eq('id', id)
        .single();

      if (error) console.error("Failed to fetch review:", error);
      else setReview(data);

      await fetchComments();
      setLoading(false);
    };

    fetchUser();
    fetchReviewAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const contentToSubmit = replyingToId ? replyContent : mainComment;

    if (!contentToSubmit.trim()) return;

    const payload = {
      content: contentToSubmit,
      user_id: currentUser.id,
      review_id: id,
    };

    if (replyingToId) {
      payload.parent_comment_id = replyingToId;
    }

    const { error } = await supabase.from('comments').insert([payload]);

    if (error) console.error("Failed to insert comment:", error);
    else {
      await fetchComments();
      setMainComment('');
      setReplyContent('');
      setReplyingToId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) console.error("Delete failed:", error);
    else fetchComments();
  };

  if (loading) return <p>Loading...</p>;
  if (!review) return <p>Review not found.</p>;

  const {
    profile = {},
    timestamp,
    activity,
    review_text,
    cuisine,
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
        {/* Review content */}
        <div className="restaurant-info">
          <h2>@{profile?.username || 'Unknown User'}</h2>
          <p>{timestamp ? new Date(timestamp).toLocaleString() : 'No date provided'}</p>
        </div>
        <hr style={{ margin: '1rem 0', width: '100%', borderColor: '#ccc' }} />
        {restaurant?.name && (
          <div style={{ marginBottom: '1rem' }}>
            <h3>{restaurant.name}</h3>
            {restaurant.address && <p style={{ color: '#f44336' }}>At {restaurant.address}</p>}
          </div>
        )}
        {activity && (
          <div className="form-row"><label>Activity</label><input type="text" value={activity} readOnly /></div>
        )}
        {review_text && (
          <div className="form-row"><label>Description</label><textarea value={review_text} readOnly /></div>
        )}
        {cuisine && (
          <div className="form-row"><label>Cuisine</label><input type="text" value={cuisine} readOnly /></div>
        )}
        {Array.isArray(review_images) && review_images.length > 0 && (
          <div className="review-images-container">
            {review_images.map((img, idx) => (
              <div className="review-image-wrapper" key={idx}>
                <img src={img} alt={`review-${idx}`} className="review-image" />
              </div>
            ))}
          </div>
        )}
        {tags.length > 0 && (
          <div className="tags">
            <label>Tags:</label>
            <div className="tag-container-for-view">
              {tags.map((tag, idx) => <span key={idx} className="tag selected">{tag}</span>)}
            </div>
          </div>
        )}
        <div className="emoji-spectrum">
          {[1, 2, 3, 4, 5].map(val => (
            <span key={val} className={`emoji-option ${val <= emojiRating ? 'selected' : ''}`} style={{ pointerEvents: 'none' }}>
              {ratingType === 'yeet' ? '🤢' : '🔥'}
            </span>
          ))}
        </div>

        {/* COMMENTS */}
        <h3 style={{ textAlign: 'center', marginTop: '2rem' }}>Comments</h3>
        <div className="comment-section">
          {comments.map(c => (
            <div key={c.id} className="comment-card">
              <div className="comment-header">
                <img
                  src={c.profile?.avatar_url || DEFAULT_AVATAR}
                  alt="avatar"
                  className="comment-avatar"
                />
                <div>
                  <strong>@{c.profile?.username || 'Anonymous'}</strong>
                  <br />
                  <small>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              </div>

              <p>{c.content}</p>

              <div className="comment-actions">
                <button onClick={() => {
                  setReplyingToId(c.id);
                  setReplyContent('');
                }}>Reply</button>
                {currentUser?.id === c.user_id && (
                  <>
                    <button onClick={() => {
                      setEditingCommentId(c.id);
                      setEditedContent(c.content);
                    }}>Edit</button>
                    <button onClick={() => handleDeleteComment(c.id)}>Delete</button>
                  </>
                )}
              </div>

              {replyingToId === c.id && (
                <form onSubmit={handleCommentSubmit} style={{ marginTop: '0.5rem' }}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      marginBottom: '0.5rem',
                    }}
                    required
                  />
                  <button type="submit" className="comment-action-button">
                    Post Reply
                  </button>
                </form>
              )}

              {c.replies?.length > 0 && (
                <div className="reply-thread">
                  {c.replies.map(r => (
                    <div key={r.id} className="reply">
                      <div className="reply-header">
                        <img
                          src={r.profile?.avatar_url || DEFAULT_AVATAR}
                          alt="avatar"
                          className="reply-avatar"
                        />
                        <strong>@{r.profile?.username || 'Anonymous'}</strong>
                        <small style={{ color: '#999', marginLeft: '0.5rem' }}>
                          {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                      <p className="reply-content">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* New Comment */}
          <form onSubmit={handleCommentSubmit} style={{ marginTop: '2rem' }}>
            <textarea
              value={mainComment}
              onChange={(e) => setMainComment(e.target.value)}
              placeholder="Leave a comment..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                resize: 'vertical',
              }}
              required
            />
            <button type="submit" className="submit-button" style={{ width: '100%', marginTop: '0.5rem' }}>
              Post Comment
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ViewReview;
