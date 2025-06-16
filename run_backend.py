from backend.app import app

print("🚀 Backend booting...")

if __name__ == "__main__":
    app.run(debug=True, port=5050)
