from app import app, db
from flask_migrate import Migrate


migrate = Migrate(app, db)

print("🚀 Backend booting...")

@app.shell_context_processor
def make_shell_context():
    return {"app": app, "db": db}

if __name__ == "__main__":
    app.run(debug=True, port=5050)
