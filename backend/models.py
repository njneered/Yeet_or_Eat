from flask_sqlalchemy import SQLAlchemy
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import datetime
from extensions import db

class Restaurants(db.Model):
    __tablename__ = 'restaurants'

    id = db.Column(db.Integer, primary_key=True)
    yelp_id = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255))
    rating = db.Column(db.Float)
    price = db.Column(db.String(10))  # $, $$, $$$
    image_url = db.Column(db.String(500))

    # Optional: add timestamp
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    reviews = db.relationship("Review", backref="restaurant", lazy=True)  # assuming you have a Review model

    def __repr__(self):
        return f"<Restaurant {self.name}>"
    
class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(), unique=True)
    email = db.Column(db.String(), unique=True)
    reviews = db.relationship("Review", backref="profile", lazy=True)
    
class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('profiles.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    dish_id = db.Column(db.Integer)
    rating = db.Column(db.Integer)
    review_text = db.Column(db.Text)
    timestamp = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    restaurant_name = db.Column(db.Text)
    username = db.Column(db.Text)
    activity = db.Column(db.Text)
    cuisine = db.Column(db.Text)
    privacy = db.Column(db.Text)
    tags = db.Column(ARRAY(db.Text))