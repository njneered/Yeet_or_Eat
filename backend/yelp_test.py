from app import app
from extensions import db
from yelp_sync import fetch_yelp_data, save_businesses_to_db
import time

terms = ["restaurants", "sushi", "bbq", "vegan", "coffee", "seafood"]
locations = [
    "Gainesville, FL 32601",
    "Gainesville, FL 32603",
    "Gainesville, FL 32605",
    "Gainesville, FL 32608",
    "Gainesville, FL 32609"
]

with app.app_context():
    for term in terms:
        for location in locations:
            print(f"Fetching {term} in {location}...")
            try:
                businesses = fetch_yelp_data(location=location, term=term, limit=240)
                save_businesses_to_db(businesses)
                print(f"Added {len(businesses)} from {term} in {location}")
            except Exception as e:
                print(f"Error fetching {term} in {location}: {e}")
            time.sleep(1)  # pause to avoid rate limiting