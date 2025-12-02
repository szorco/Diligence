# 🗓️ Diligence

A schedule planning website that provides users a quick and easy way to create daily/weekly schedules.

---

## 🚀 Tech Stack

- **Frontend:** React (deployed on [Vercel](https://vercel.com/))
- **Backend:** FastAPI (deployed on [Render](https://render.com/))
- **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com/))

---

## 📌 Main Features

-  Create daily and weekly schedules
- ♻️ Build reusable "task blocks" for recurring events
  - Example: User has 2 hours of soccer practice every day, but times vary → create a 2-hour "soccer practice" block and reuse it across the week
- 🎯 Drag-and-drop scheduling for fast, intuitive planning

---

## ⚡ Other Functions

- 📂 Upload RPI schedule
- 📊 Robinhood-inspired dashboard to track progress

---

## 💡 Future Ideas

- 🤖 AI-powered insights and scheduling advice
- 📅 Last updated: 2025-10-29

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd diligence
```

### 2. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Runs at:** `http://127.0.0.1:8000`

#### Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm start
```

**Runs at:** `http://localhost:3000`

#### API URL Setup

Set your API URL in the frontend (e.g., `src/config.js`):

```javascript
export const API_URL = "http://127.0.0.1:8000"; // Local dev
```

