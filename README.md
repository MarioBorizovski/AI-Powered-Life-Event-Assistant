1. Run the Backend (FastAPI)
Open a terminal and run the following commands:

bash
# Navigate to the backend directory
cd backend
# Activate the virtual environment (Windows)
.venv\Scripts\activate
# Install dependencies (if you haven't already)
pip install -r requirements.txt
# Start the FastAPI server
uvicorn main:app --reload
The backend will be available at: http://localhost:8000

2. Run the Frontend (Next.js)
Open a new terminal and run:

bash
# Navigate to the frontend directory
cd assistant-frontend
# Install dependencies (since the project uses pnpm)
pnpm install
# Start the development server
pnpm run dev
The frontend will be available at: http://localhost:3000
