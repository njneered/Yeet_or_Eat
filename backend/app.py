print("app.py loaded")
from flask import Flask
from backend.config_settings import Config

app = Flask(__name__)
app.config.from_object(Config)

@app.route("/")
def home():
    return "Yeet or Eat Backend Running!"
