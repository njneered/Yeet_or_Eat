print("app.py loaded")
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from config_settings import Config
from db_models import User, db, Review, Restaurant, Dish
import re
from datetime import timedelta

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db.init_app(app)
jwt = JWTManager(app)


def emailValidation(email):
    characters = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(characters, email) is not None

def passwordValidation(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, "Valid Password"

def usernameValidation(username):
    if len(username) < 3 or len(username) > 20:
        return False, "Username must be between 3-20 characters"
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers and underscore(_)"
    return True, "Valid username"

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

@app.route('/review', methods=['POST'])
@jwt_required()
def review():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"message": "You need to log in to post a review!"}), 401

    data = request.get_json()
    restaurantName = data.get('restaurant')
    dishName = data.get('dish')
    rating = data.get('rating')
    comment = data.get('comment')

    if not restaurantName or not dishName or rating is None:
        return jsonify({"message": "All fields are required!"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"message": "Rating must be between 1 and 5!"}), 400

    # 🔍 Find or create Restaurant
    restaurant = Restaurant.query.filter_by(name=restaurantName).first()
    if not restaurant:
        restaurant = Restaurant(name=restaurantName)
        db.session.add(restaurant)
        db.session.commit()

    # 🔍 Find or create Dish (must be linked to a restaurant)
    dish = Dish.query.filter_by(name=dishName, restaurant_id=restaurant.id).first()
    if not dish:
        dish = Dish(name=dishName, restaurant_id=restaurant.id)
        db.session.add(dish)
        db.session.commit()

    # ✅ Create Review using IDs
    new_review = Review(
        user_id=user_id,
        restaurant_id=restaurant.id,
        dish_id=dish.id,
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
