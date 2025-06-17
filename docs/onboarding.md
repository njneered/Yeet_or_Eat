👋 Welcome to Yeet or Eat: Onboarding Guide

This guide will walk you through everything you need to know to get up and running with the Yeet or Eat project.

📁 Project Structure

yeet_or_eat/
├── frontend/        # React app
├── backend/         # Flask app
├── .gitignore       # Ignores unnecessary files
├── README.md        # Project overview
└── docs/            # Documentation lives here
    └── onboarding.md  # You are here

✅ Prerequisites

General

Git

Node.js + npm

Python 3.x

PostgreSQL (optional, for DB work)

💻 Setting Up Frontend

cd frontend
npm install
npm start

App runs at: http://localhost:3000

Update .env if needed:

REACT_APP_API_URL=http://localhost:5050

🐍 Setting Up Backend

cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run_backend.py

Backend runs at: http://localhost:5050

Configurable in config_settings.py

🧬 DB Initialization

For now, each developer will set up their own local PostgreSQL database for development. Follow these steps:

1. Ensure PostgreSQL is running locally
    # If you're on macOS, within terminal:
    brew services start postgresql

2. Create the database (once):
    createdb yeetoreat_db

3. Update your .env file (in backend/) with:
    DATABASE_URL=postgresql://postgres:yourpassword@localhost/yeetoreat_db
    SECRET_KEY=super-secret-dev-key
    DEBUG=true

4. Activate the virtual environment and run migrations:
    cd backend
    source venv/bin/activate  # (use venv\Scripts\activate on Windows)
    flask db init             # Only once
    flask db migrate -m "Initial migration"
    flask db upgrade

    This sets up the schema defined in db_models.py using Alembic.

5. To reset the database (wipe and recreate all tables):
    # In a Python shell with virtualenv active
    from app import app, db
    with app.app_context():
        db.drop_all()
        db.create_all()

🧪 Test Routes (Backend)

Use Postman, browser, or curl:

curl http://localhost:5050/ping

Expected response:

{"message": "pong"}

🌱 Branching & Collaboration

main is protected. Make a feature branch:

git checkout -b your-feature-name

Commit with clear messages.

Open a pull request.

📌 Tips

Don't commit .env or node_modules.

Use npm run build before deploying frontend.

Use virtualenv for backend to avoid dependency issues.

🙌 Need Help?

Ping any team member on Slack.

Welcome to the team, and YEET responsibly. 🍽️