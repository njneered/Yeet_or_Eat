print("app.py loaded")
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from config_settings import Config
from db_models import User, db, Review

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)

@app.route('/login', methods=['POST'])
def login():

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    valid_user = User.query.filter_by(email=email).first()
    if valid_user and valid_user.checkPassword(password):
        #set user_id for the session
        session['user_id'] = valid_user.id
        return jsonify({"message" : "Login successful!"}), 200
    return jsonify({"message" : "Invalid credentials"}), 401


@app.route('/signup', methods = ['POST'])
def signup():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')

        # Check if the user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "Email already registered"}), 409

        # Create a new user
        new_user = User(username=username, email=email)
        new_user.setPassword(password) # Hashed password for security
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": f"Account created for {username}!"}), 201

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"}), 200

@app.route('/review', methods=['POST'])
def review():
    #Check user is logged
    if 'user_id' not in session:
        return jsonify({"message": "You need to log in to post a review! Thanks!"}), 401

    # Get user_id
    user_id = session['user_id']

    # Get the review parameters
    data = request.get_json()
    restaurant = data.get('restaurant')
    dish = data.get('dish')
    rating = data.get('rating')
    comment = data.get('comment')

    if not restaurant or not dish or not rating:
        return jsonify({"message" : "All fields are required!"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"message" : "Rating must be between 1 and 5!"})

    # Create the new review
    new_review = Review(
        user_id=user_id,
        restaurant=restaurant,
        dish=dish,
        rating=rating,
        comment=comment
    )

    # Add the review to the database
    db.session.add(new_review)
    db.session.commit()

    return jsonify({"message": "Review added successfully! Thank you!"}), 201


if __name__ == "__main__":
    app.run(debug=True, port =5050)
