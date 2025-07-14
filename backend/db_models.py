

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

class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    dishes = db.relationship('Dish', backref='restaurant', lazy=True)            #backref so we can access restauran<-->dish
    reviews = db.relationship('Review', backref='restaurant', lazy=True)         #backref so we can access restaurant<-->review

class Dish(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    reviews = db.relationship('Review', backref='dish', lazy=True)               #backref so we can access dish<-->review




