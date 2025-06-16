print("app.py loaded")
from flask import Flask
from flask_cors import CORS
from backend.config_settings import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

@app.route("/ping")
def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    app.run(debug=True, port =5050)
