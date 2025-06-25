print("app.py loaded")
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from config_settings import Config
from db_models import User, db, Review
import re
from datetime import timedelta

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db.init_app(app)
jwt = JWTManager(app)

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({
                'error': "Missing credentials",
                'message' : 'Email and password required'
            }), 400

        valid_user = User.query.filter_by(email=email).first()

        if not valid_user or not valid_user.checkPassword(password):
            return jsonify({"message": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(valid_user.id))

        return jsonify({
            "message" : 'Login Successful!',
            "access_token" : access_token,
            "user" : {
                "id" : valid_user.id,
                "username" : valid_user.username,
                "email" : valid_user.email
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error' : 'Login Failed',
            'message' : str(e)
        }), 500

@app.route('/signup', methods = ['POST'])
def signup():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        
        # Would of put check in for empty fields but frontend seems to handle that

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
@jwt_required()
def review():
    user_id = get_jwt_identity()
    #Check user is logged
    if not user_id:
        return jsonify({"message": "You need to log in to post a review! Thanks!"}), 401

    # Get the review parameters
    data = request.get_json()
    restaurant = data.get('restaurant')
    dish = data.get('dish')
    rating = data.get('rating')
    comment = data.get('comment')

    if not restaurant or not dish or rating is None:
        return jsonify({"message" : "All fields are required!"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"message" : "Rating must be between 1 and 5!"}), 400

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
