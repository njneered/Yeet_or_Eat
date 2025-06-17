import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False