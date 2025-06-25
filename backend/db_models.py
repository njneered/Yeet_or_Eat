

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

# User model: stores user information.
# Fields include user ID, username, email, and password hash. -- Most likely will need to include reviews to store user specific reviews. 
# Passwords are hashed for security.
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique = True, nullable = False)
    email = db.Column(db.String(80), unique = True, nullable = False)
    password_hash = db.Column(db.Text, nullable = False)
    
    def setPassword(self, password):
        self.password_hash = generate_password_hash(password)
        
    def checkPassword(self, password):
        return check_password_hash(self.password_hash, password)

# Review model: stores user-submitted reviews.
# Fields include review ID, associated user, restaurant name, dish name, 1–5 rating, optional comment, and timestamp.
# This structure can be expanded later to add more attributes or adjusted to fix bugs.
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Id of review (autoincrements)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),nullable=False)  # nullable set to false meaning cannot be left empty
    restaurant = db.Column(db.String(30), nullable=False)  # char limit 30
    dish = db.Column(db.String(30), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(300))  # char limit 300
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User',backref='reviews')  # makes it so we can access reviews from a user and also user from reviews.


