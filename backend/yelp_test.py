from app import app
from extensions import db
from yelp_sync import fetch_yelp_data, save_businesses_to_db

with app.app_context():
    businesses = fetch_yelp_data(location="Gainesville, FL", term="restaurants", limit=240)
    save_businesses_to_db(businesses)
    print(f"Successfully added {len(businesses)} businesses.")