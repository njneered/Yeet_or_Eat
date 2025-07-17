import requests
from extensions import db
from models import Restaurants
import os
from dotenv import load_dotenv

load_dotenv()

YELP_API_KEY = os.getenv("YELP_API_KEY")
HEADERS = {"Authorization": f"Bearer {YELP_API_KEY}"}
BASE_URL = "https://api.yelp.com/v3/businesses/search"

def fetch_yelp_data(location="Gainesville, FL", term="restaurants", limit=20):
    params = {"location": location, "term": term, "limit": limit}
    response = requests.get(BASE_URL, headers=HEADERS, params=params)
    if response.status_code != 200:
        raise Exception(f"Yelp API error: {response.status_code} {response.text}")
    return response.json().get("businesses", [])

def save_businesses_to_db(businesses):
    for biz in businesses:
        if not Restaurants.query.filter_by(yelp_id=biz["id"]).first():
            new_restaurant = Restaurants(
                yelp_id = biz["id"],
                name = biz["name"],
                address = ", ".join(biz["location"]["display_address"]),
                rating = biz.get("rating"),
                price = biz.get("price"),
                image_url = biz.get("image_url"),
            )
            db.session.add(new_restaurant)
    db.session.commit()