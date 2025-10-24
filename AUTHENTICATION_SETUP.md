# 🔐 Authentication Setup Guide

This guide will help you set up user authentication for the Diligence app.

## 📋 What's Been Implemented

### Backend Changes
-  **Database Schema**: Complete user authentication tables
-  **JWT Authentication**: Secure token-based authentication
-  **Password Hashing**: Bcrypt password security
-  **User-Specific Data**: Tasks are now tied to users
-  **API Endpoints**: Login, signup, and protected routes

### Frontend Changes
-  **Login/Signup Pages**: Beautiful forms matching your design
-  **Authentication Context**: Global auth state management
-  **Protected Routes**: Dashboard requires authentication
-  **API Integration**: All task operations now use authenticated API

##  Quick Setup

### 1. Database Setup

First, run the database setup script:

```bash
# Update the database connection string in setup_database.py first!
python setup_database.py
```

**Important**: Update the connection string in `setup_database.py` with your actual database credentials.

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Update Database Connection

Edit `backend/db.py` and `backend/auth.py` to use your actual database credentials:

```python
# Replace this line in both files:
conn_string = "postgresql://postgres:YOUR_PASSWORD@db.yhemeqmzqprdasvchttj.supabase.co:5432/postgres"
```

### 4. Start Backend Server

```bash
cd backend
uvicorn main:app --reload
```

### 5. Start Frontend

```bash
cd frontend
npm start
```

## 🔧 Configuration

### Backend Configuration

Update these files with your database credentials:
- `backend/db.py`
- `backend/auth.py`

### Frontend Configuration

The API URL is configured in `frontend/src/config.js`:

```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
```

For production, set the environment variable:
```bash
REACT_APP_API_URL=https://your-backend-url.com
```

## 🧪 Testing the Authentication

### 1. Test User Registration
1. Go to your app (http://localhost:3000)
2. Click "Get Started" 
3. You'll see the login page
4. Click "Sign up" to create a new account
5. Fill in the registration form

### 2. Test User Login
1. Use the credentials you just created
2. You should be redirected to the dashboard
3. Your name should appear in the header
4. You should see a logout button

### 3. Test Task Management
1. Create a new task - it will be saved to the database
2. Edit/delete tasks - all operations are user-specific
3. Logout and login with a different account
4. You should see only your own tasks

##  Database Schema

The following tables are created:

### `users` table
- `id` (SERIAL PRIMARY KEY)`
- `email` (VARCHAR, UNIQUE)`
- `name` (VARCHAR)`
- `password_hash` (VARCHAR)`
- `created_at`, `updated_at` (TIMESTAMP)`
- `is_active`, `email_verified` (BOOLEAN)`

### `tasks` table (updated)
- All existing fields
- `user_id` (INTEGER, FOREIGN KEY to users.id)`

### `user_sessions` table
- For JWT token management
- `user_id`, `token_hash`, `expires_at`

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Tokens**: Secure, stateless authentication
- **User Isolation**: Each user only sees their own data
- **Token Expiration**: Tokens expire after 30 minutes
- **Protected Routes**: All task operations require authentication

##  Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your database credentials
   - Ensure your database is running
   - Verify the connection string format

2. **Authentication Not Working**
   - Check that the backend is running on the correct port
   - Verify the API_URL in frontend config
   - Check browser console for errors

3. **Tasks Not Loading**
   - Ensure you're logged in
   - Check that the database has the correct schema
   - Verify API endpoints are working

### Debug Steps

1. **Check Backend Logs**
   ```bash
   cd backend
   uvicorn main:app --reload --log-level debug
   ```

2. **Check Frontend Console**
   - Open browser dev tools
   - Look for network errors in the Console tab

3. **Test API Endpoints**
   ```bash
   # Test if backend is running
   curl http://127.0.0.1:8000/
   
   # Test registration
   curl -X POST http://127.0.0.1:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
   ```

## 🎯 Next Steps

After authentication is working:

1. **Email Verification**: Add email verification for new accounts
2. **Password Reset**: Implement password reset functionality
3. **Social Login**: Add Google/GitHub OAuth
4. **User Profiles**: Allow users to update their profiles
5. **Admin Panel**: Create admin interface for user management

##  API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Tasks (Protected)
- `GET /tasks` - Get user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

All task endpoints require authentication via JWT token in the Authorization header.

## 🔄 Migration from Local Storage

The app now uses the database instead of localStorage. If you had existing tasks in localStorage, they won't automatically migrate. Users will need to recreate their tasks after logging in.

This is intentional for security - each user should only see their own data, and we can't automatically determine which localStorage tasks belong to which user.
