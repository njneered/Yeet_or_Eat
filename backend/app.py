print("app.py loaded")
from flask import Flask
from flask_cors import CORS
from config_settings import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

@app.route('/login', methods=['POST'])
def login():

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    valid_user = {
        "email" : "test@example.com",
        "password" : "123"
    }

    if email == valid_user["email"] and password == valid_user["password"] :
        return jsonify({"message" : "Login successful!"}), 200
    return jsonify({"message" : "Invalid credentials"}), 401


@app.route('/signup', methods = ['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    # TEMPORARY SIGN UP LOGIC
    # LATER: CHECK IF EMAIL EXISTS IN DB AND STORE USER SECURELY
    print(f"Received signup: {username}, {email}")

    return jsonify({"message" : f"Account created for {username}!"}), 201

if __name__ == "__main__":
    app.run(debug=True, port =5050)
