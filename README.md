# YEET OR EAT

A chaotic, meme-friendly review app where college students rate meals with the same energy they rate memes. Built for hot takes, food therapy, and midnight taco thoughts.


## Overview

**Yeet or Eat** lets users log and react to food experiences in a way that reflects real student culture—authentic, funny, emotional, and bold. It’s not just about food quality; it’s about how that meal *hit*.


## Tech Stack

| Layer      | Tools                       |
|------------|-----------------------------|
| Frontend   | React, JavaScript, HTML/CSS |
| Backend    | Python, Flask               |
| Database   | PostgreSQL (via backend)    |


## Getting Started

### Frontend Setup

> React app reset and working as of June 16th.

> Flask app reset and working as of June 16th.

bash
cd frontend
npm install
npm start


> Visit http://localhost:3000

> The page reloads on changes

> Errors will show in the console



### Backend Setup

cd backend
python -m venv venv

#### Windows:
venv\Scripts\activate
#### macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run_backend.py

> Make sure to add your .env file if required, or copy from .env.example

> Visit http://localhost:5050 to confirm the backend is running


### Environment Variables

> Create a .env file inside frontend/ with the following:

REACT_APP_API_URL=http://localhost:5050

> Add any additional variables as needed.


### Scripts (Frontend)

npm start (Run the dev server)
npm run build (Build app for production)
npm test (Run tests)
npm run eject (Eject Creat React App config)


## Contributing

> If you're contributing:
- Branch off main
- Use clear commit messages
- Push and open a pull request

> Need help onboarding? Ask us or check our docs/onboarding.md



## TEAM


| Team       | Responsibilities|
|------------|-----------------|
| Dylan      | Fullstack       |
| Gabriel    | Database        |
| NJ         | Fullstack       |
| Santiago   | Backend         |

## DEV NOTES
> Backend logs run in terminal
> Basic routes like /ping for testing backend connectivity
> To add Flask routes, update app.py

## LEARN MORE

> https://create-react-app.dev/

## FLASK DOCS

> https://flask.palletsprojects.com/en/stable/

