print("app.py loaded")
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from config_settings import Config
from flask_migrate import Migrate
import re
import os
from dotenv import load_dotenv
from datetime import timedelta
from supabase_token import verify_supabase_token
from yelp_sync import fetch_yelp_data, save_businesses_to_db
from extensions import db

load_dotenv()
app = Flask(__name__)
CORS(app)

app.config.from_object(Config)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False



db.init_app(app)
migrate = Migrate(app, db)
from models import *

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

        access_token = create_access_token(identity=str(valid_user.id), additional_claims={
            'username': valid_user.username,
            'email': valid_user.email
        })

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
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}),400

        email = data.get('email','').strip().lower()
        password = data.get('password','')
        username = data.get('username','').strip()

        # Check for missing data
        if not email or not password or not username:
            return jsonify({
                'error': 'Missing required fields',
                'message': 'Email, password, and username are required'
            }), 400
        #Validate email, password and username
        if not (emailValidation(email)):
            return jsonify({'error': 'Invalid email'}),400

        validPassword, passwordMSG = passwordValidation(password)
        if not validPassword:
            return jsonify({'error': 'Invalid password', 'message': passwordMSG}),400

        validUsername, usernameMSG = usernameValidation(username)
        if not validUsername:
            return jsonify({'error': 'Invalid username', 'message': usernameMSG}),400

        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()

        if existing_user:
            if existing_user.email == email:
                return jsonify({'error': 'Email already in use'}), 409
            else:
                return jsonify({'error': 'Username already in use'}), 409

        # Create a new user
        new_user = User(username=username, email=email)
        new_user.setPassword(password) # Hashed password for security
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': f'Account created for {username}!',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error':'Registration process failed','message': str(e)}),500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"}), 200

from supabase_token import verify_supabase_token

@app.route('/review', methods=['POST'])
def review():
    # Step 1: Extract token from Authorization header
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')

    # Step 2: Verify token
    payload = verify_supabase_token(token)
    if not payload:
        return jsonify({"message": "Invalid or missing token"}), 401

    user_id = payload['sub']  # Supabase user ID (UUID)

    # Step 3: Extract review data
    data = request.get_json()
    restaurant = data.get('restaurant')
    dish = data.get('dish')
    rating = data.get('rating')
    comment = data.get('comment')

    if not restaurant or not dish or rating is None:
        return jsonify({"message": "All fields are required!"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"message": "Rating must be between 1 and 5!"}), 400

    # Step 4: Create review
    new_review = Review(
        user_id=user_id,
        restaurant=restaurant,
        dish=dish,
        rating=rating,
        comment=comment
    )

    db.session.add(new_review)
    db.session.commit()

    return jsonify({"message": "Review added successfully!"}), 201


@app.route('/reviews', methods=['GET'])
def getReviews():
    try:
        restaurantNameFilter = request.args.get('restaurant')

        if restaurantNameFilter:
            reviews = Review.query.join(Restaurant).filter(Restaurant.name == restaurantNameFilter).order_by(Review.timestamp.desc()).all()

        else:
            reviews = Review.query.order_by(Review.timestamp.desc()).all()

        result = []

        for review in reviews:
            result.append({
                "id": review.id,
                "restaurant": review.restaurant.name,
                "dish": review.dish.name,
                "rating": review.rating,
                "comment": review.comment,
                "timestamp": review.timestamp.isoformat(),
                "user": {
                    "id": review.user.id,
                    "username": review.user.username,
                    "email": review.user.email
                }
            })
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": "Failed to load the reviews", "message": str(e)}), 500

@app.route('/user-reviews', methods=['GET'])
@jwt_required()
def getUserReviews():
    try:
        user_id = get_jwt_identity()
        reviews = Review.query.filter_by(user_id=user_id).order_by(Review.timestamp.desc()).all()
        result = []

        for review in reviews:
            result.append({
                "id": review.id,
                "restaurant": review.restaurant.name,
                "dish": review.dish.name,
                "rating": review.rating,
                "comment": review.comment,
                "timestamp": review.timestamp.isoformat(),
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Failed to load user reviews", "message": str(e)}), 500

@app.route('/review/<int:reviewID>', methods=['PUT'])
@jwt_required()
def editReview(reviewID):
    try:
        userID = get_jwt_identity()
        review = Review.query.get(reviewID)

        if not review:
            return jsonify({"error": "Review not found!"}), 404

        if review.user_id != int(userID):
            return jsonify({"error": "Unauthorized"}), 403

        data =request.get_json()

        review.rating = data.get('rating', review.rating)
        review.comment = data.get('comment', review.comment)

        newDishName = data.get('dish')
        if newDishName:
            dish = Dish.query.filter_by(name=newDishName, restaurant_id=review.restaurant_id).first()
            if not dish:
                dish = Dish(name=newDishName, restaurant_id=review.restaurant_id)
                db.session.add(dish)
                db.session.commit()
            review.dish_id = dish.id

        db.session.commit()
        return jsonify({"message": "Review updated successfully!"}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to update review, try again', "message": str(e)}), 500

@app.route('/review/<int:reviewID>', methods=['DELETE'])
@jwt_required()
def deleteReview(reviewID):
    try:
        userID = get_jwt_identity()
        review = Review.query.get(reviewID)

        if not review:
            return jsonify({"error": "Review not found!"}), 404

        if review.user_id != int(userID):
            return jsonify({"error": "Unauthorized"}), 403

        db.session.delete(review)
        db.session.commit()

        return jsonify({"message": "Review deleted successfully!"}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to delete review', "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port =5050)
    
@app.route("/import-restaurants", methods=["POST"])
def import_restaurants():
    location = request.json.get("location", "Gainesville, FL")
    term = request.json.get("term", "restaurants")
    
    try:
        businesses = fetch_yelp_data(location=location, term=term, limit=10)
        save_businesses_to_db(businesses)
        return jsonify({"message": f"Successfully imported {len(businesses)} businesses"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
