import requests
from extensions import db
from models import Restaurants
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

YELP_API_KEY = os.getenv("YELP_API_KEY")
HEADERS = {"Authorization": f"Bearer {YELP_API_KEY}"}
BASE_URL = "https://api.yelp.com/v3/businesses/search"

def fetch_yelp_data(location="Gainesville, FL", term="restaurants", limit=240):
    all_businesses = []
    page_limit = 50 

    for offset in range(0, min(limit, 240), page_limit):
        params = {
            "location": location,
            "term": term,
            "limit": min(page_limit, 240 - offset),
            "offset": offset
        }
        response = requests.get(BASE_URL, headers=HEADERS, params=params)
        if response.status_code != 200:
            raise Exception(f"Yelp API error: {response.status_code} {response.text}")

        businesses = response.json().get("businesses", [])
        if not businesses:
            break  
        all_businesses.extend(businesses)

    return all_businesses

def save_businesses_to_db(businesses):
    for biz in businesses:
        categories = [cat["title"] for cat in biz.get("categories", [])]
        existing = Restaurants.query.filter_by(yelp_id=biz["id"]).first()

        if existing:
            # Update existing restaurant
            existing.name = biz["name"]
            existing.address = ", ".join(biz["location"]["display_address"])
            existing.rating = biz.get("rating")
            existing.price = biz.get("price")
            existing.image_url = biz.get("image_url")
            existing.phone = biz.get("display_phone")
            existing.category_tags = ", ".join(categories)
            existing.latitude = biz["coordinates"]["latitude"]
            existing.longitude = biz["coordinates"]["longitude"]
            existing.yelp_url = biz.get("url")
            existing.review_count = biz.get("review_count")
            existing.last_synced = datetime.utcnow()
        else:
            # Create new restaurant
            new_restaurant = Restaurants(
                yelp_id = biz["id"],
                name = biz["name"],
                address = ", ".join(biz["location"]["display_address"]),
                rating = biz.get("rating"),
                price = biz.get("price"),
                image_url = biz.get("image_url"),
                phone = biz.get("display_phone"),
                category_tags = ", ".join(categories),
                latitude = biz["coordinates"]["latitude"],
                longitude = biz["coordinates"]["longitude"],
                yelp_url = biz.get("url"),
                review_count = biz.get("review_count"),
                last_synced = datetime.utcnow()
            )
            db.session.add(new_restaurant)

    db.session.commit()