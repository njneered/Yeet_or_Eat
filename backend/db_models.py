

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique = True, nullable = False)
    email = db.Column(db.String(80), unique = True, nullable = False)
    password_hash = db.Column(db.Text, nullable = False)
    
    def setPassword(self, password):
        self.password_hash = generate_password_hash(password)
        
    def checkPassword(self, password):
        return check_password_hash(self.password_hash, password)