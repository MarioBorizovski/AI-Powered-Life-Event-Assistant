
1. Run the Backend (FastAPI)
Open a terminal and run the following commands:
# Navigate to the backend folder
cd backend

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install dependencies
python -m pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
The backend will run on:
http://localhost:8000
________________________________________
2. Run the Frontend (Next.js)
Open a new terminal and run:
# Navigate to the frontend folder
cd assistant-frontend

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
The frontend will run on:
http://localhost:3000
