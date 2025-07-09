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

- Git
- Node.js + npm
- Python 3.x
- Poetry
- PostgreSQL (optional, for DB work)

## Installing Poetry (one-time setup)
On macOS / Linux:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

- If CERTIFICATE_VERIFY_FAILED
```bash
/Applications/Python\ 3.12/Install\ Certificates.command
On Windows (PowerShell):
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

Then verify:
```bash
poetry --version
```

To get install location:
```bash
which poetry
```

Add install location to Preferences: Open Settings (JSON)
```json
"terminal.integrated.env.osx": {
  "PATH": ["Your Path:${env:PATH}"]
}
```
- EX: /Users/mook./.local/bin/poetry -> "PATH": "/Users/mook./.local/bin:${env:PATH}"

- To install any further dependencies just run:
```bash
poetry add [dependency]
```

Be sure to remove requirements.txt and venv!!
```bash
rm requirements.txt
rm -rf venv
```

💻 Setting Up Frontend

```bash
cd frontend
npm install
npm start
```

App runs at: http://localhost:3000

Update .env if needed:

```
REACT_APP_API_URL=http://localhost:5050
```

🐍 Setting Up Backend

```bash
cd backend
poetry install                # Install dependencies
poetry self add poetry-plugin-shell # Install Poetry shell plugin (One-time)
poetry shell                  # Enter virtual environment
poetry run python run_backend.py  # Start server
```

Backend runs at: http://localhost:5050

All backend config is set in config_settings.py, which reads environment variables from .env.

🧬 DB Initialization

1. Open a Poetry shell in the backend:

   ```bash
   poetry shell
   ```

2. Run the following to create the database tables:

   ```python
   from app import app
   from db_models import db
   with app.app_context():
       db.create_all()
   ```

3. To drop and recreate tables:

   ```python
   with app.app_context():
       db.drop_all()
       db.create_all()
   ```

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

Use Poetry to manage Python dependencies and virtual environments

Optional: run `poetry export` to generate `requirements.txt` if needed for deployment

🙌 Need Help?

Ping any team member on Slack.

Welcome to the team, and YEET responsibly. 🍽️