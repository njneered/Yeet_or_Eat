import React, {useState} from 'react';
import './SubmitReview.css';
import Header from '../components/Header';
import supabase from '../supabaseClient';
import { useEffect } from 'react';


// FORM STATE BEFORE CONDITIONS
const SubmitReview = () => {
    const [user, setUser] = useState(null);
    const [activity, setActivity] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [privacy, setPrivacy] = useState('Friends Only');
    const [ratingType, setRatingType] = useState(null); // 'yeet' or 'eat'
    const [emojiRating, setEmojiRating] = useState(0); // 1-5
    const [selectedType, setSelectedType] = useState(null);
    const [tags, setTags] = useState([]);
    const [image, setImage] = useState(null);

    useEffect(() => {
    const fetchProfile = async () => {
        const {
        data: { user },
        error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
        console.error('No user found:', userError);
        return;
        }

        // Fetch username from profiles table
        const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

        if (profileError) {
        console.error('Profile fetch error:', profileError);
        } else {
        setUser({ id: user.id, email: user.email, username: profile.username });
        }
    };

    fetchProfile();
    }, []);


    if (!user) { return <p>You must be logged in to submit a review.</p>; }


    // MOCK RESTAURANT DATA FOR TESTING
    const mockRestaurant = {
        id: 42,
        name: 'Yeet Street Tacos',
        location: 'Gainesville, FL'
    };

    const handleSelect = (type) => {
    setSelectedType(type);
    setRatingType(type);
    setEmojiRating(0); // Optional: reset emoji rating on type switch
};

    const ratingOptions = [-3, -2, -1, 1, 2, 3];
    const getEmoji = (value) => {
        return value < 0 ? '🤢' : '🔥';
    };

    const tagOptions = ['🔥 Hot', 'Gluten-Free', '🤑 Dirt Cheap',
                        '🌹 Romantic', '🆒 Trendy', 'Vegan', 'Vegetarian',
                        '🎩 Fancy', '💸 Hope you had some money saved up', '🏆 Best Bathroom IYKYK',
                        '🇮🇹 Nonna approves', '🇷🇺 Babushka approves'];



    const toggleTag = (tag) => {
        setTags(prev=>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]

        );
    };


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file){
            setImage(URL.createObjectURL(file));
        }
       
    };


    const handleSubmit = async (e) =>{ // Scaling down for testing
        e.preventDefault();

        /* OLD REVIEW OBJECT -- SAVING FOR LATER
        const review = {
            user_id: user.id,
            username: user.user_metadata?.username || 'Anonymous',
            restaurant_id: mockRestaurant.id, // update this once restaurants are in Supabase
            restaurant_name: mockRestaurant.name,
            dish_id: null,
            activity,
            review_text: reviewText,
            cuisine,
            rating: ratingType === 'yeet' ? -emojiRating : emojiRating,
            privacy,
            tags,
            image,
            submitted_at: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };
        */

        const review = {
            user_id: user.id,
            username: user.username || 'Anonymous',
            restaurant_id: mockRestaurant.id, // update this once restaurants are in Supabase}
            restaurant_name: mockRestaurant.name,
            rating: ratingType === 'yeet' ? -emojiRating : emojiRating,
            dish_id: null, // optional placeholder
            review_text: reviewText,
            timestamp: new Date().toISOString()
        };

        // Log before Insert
        console.log('Submitting review:', review);
        // Insert review into Supabase
        const { data, error } = await supabase.from('reviews').insert([review]);
        // Error handling

        if (error) {
            console.error('❌ Supabase insert error:', error);
            console.log('🧾 Full review payload:', review);
            alert('Failed to submit review: ' + error.message);
        } else {
            alert('Review submitted!');
        }
        // reset form here
        

        // FORM RESETS AFTER SUBMISSION
        setActivity('');
        setReviewText('');
        setCuisine('');
        setPrivacy('Friends Only');
        setTags([]);
        setImage(null);
    };


    return(


        <>


            <Header />

            <div className="submit-review">


                <h2>Submit a Review for {mockRestaurant.name}</h2>
                <p className="reviewer-info"> Posting as <strong>@{user.username || 'Anonymous'}</strong> </p>



                <form onSubmit={handleSubmit}>
                    <label>Add Activity</label>
                    <input
                        type="text"
                        placeholder="Describe this meal in 7 words or less..."
                        value = {activity}
                        onChange={(e) => setActivity(e.target.value)}
                    />

                    <label>Description</label>
                    <textarea
                    placeholder = "How was the food? Share more about your meal and use @ to tag someone."
                    value = {reviewText}
                    onChange = {(e) => setReviewText(e.target.value)}
                    />


                    <div className = "upload-section">
                        <label htmlFor = "photo-upload" className="upload-box">
                            {image ? (
                                <img src = {image} alt = "Prove you actually ate here!" />
                            ) : (
                                <span>+ <u>Prove you actually ate here!</u></span>
                            )}
                        </label>
                        <input
                            type = "file"
                            id = "photo-upload"
                            style={{ display: 'none'}}
                            accept = "image/*"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <label>Cuisine</label>
                    
                    <div className = "form-row">
                        <select value ={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                            <option value="">Cuisine</option>
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

                    </div>    

                    <label>Who Can View?</label>
                    <div className ="form-row">
                        <select value={privacy} onChange={(e) =>setPrivacy(e.target.value)}>
                            <option value="">Who Can View?</option>
                            <option value="Friends Only">👯 Friends Only</option>
                            <option value="Everyone">🌍 Everyone</option>
                            <option value="My Eyes Only">🙈 My Eyes Only</option>

                        </select>


                        <div className="tags">
                            <label>Tags:</label>
                            {tagOptions.map((tag) =>(
                                <button
                                type="button"
                                key={tag}
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


                    </div>


                    <button type="submit" className="submit-button">Submit Review</button>


                </form>


            </div>


        </>

        
    );


};

export default SubmitReview;