print("app.py loaded")
from flask import Flask, jsonify, request
from flask_cors import CORS
from config_settings import Config
from db_models import User, db

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
        return jsonify({"message" : "Login successful!"}), 200
    return jsonify({"message" : "Invalid credentials"}), 401


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

if __name__ == "__main__":
    app.run(debug=True, port =5050)
