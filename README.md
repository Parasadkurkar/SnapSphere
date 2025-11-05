📸 A full-featured social media platform combining the best of Instagram with modern web technologies.

🌟 Features

 # 📸 Photo Sharing
Upload and share moments with your community

Beautiful image display with captions

Create posts instantly

 # 👥 Follow System

-Follow friends and see their updates in real-time

-Mutual followers detection

-Unfollow with one click

 # ❤️ Social Interactions

-Like posts from your favorite creators

-Comment on posts and engage in conversations

-Real-time like and comment counts

 # 💬 Direct Messaging
-Send private messages to friends

-Real-time message badges

-Per-conversation unread count tracking

-Auto-mark messages as read

# 🔔 Notifications
-Get notified about follows

-Follow back notifications

-Like and comment notifications

-Real-time notification badges

# 👤 User Profiles

-Customize your profile with bio

-Update profile picture

-View follower/following lists

-User statistics

# 🔍 Search Functionality

-Find and connect with other users

-Search by username or name

-Instant search results

# 🔐 Security

-JWT-based authentication

-Password hashing with bcryptjs

-Secure token management

-Protected API endpoints

# 📱 Responsive Design

-Mobile-friendly interface

-Works perfectly on all devices

-Material-UI components

-Smooth animations

# 🛠️ Tech Stack

# Frontend

React.js - UI library

React Router - Navigation

Material-UI (MUI) - Component library

Axios - HTTP client

Local Storage - Auth persistence

# Backend

Node.js - Runtime

Express.js - Web framework

MongoDB - Database

Mongoose - ODM

JWT - Authentication

bcryptjs - Password security

# 🚀 Quick Start

Prerequisites
Node.js (v14 or higher)

MongoDB (local or Atlas)

npm or yarn

Git

# Installation

1. Clone Repository
   
git clone https://github.com/Parasadkurkar/SnapSphere.git
cd SnapSphere

3. Backend Setup

cd backend
npm install

cp .env.example .env

 Edit .env with your values:
 MONGODB_URI=your_mongodb_connection_string
 JWT_SECRET=your_secret_key
 PORT=10000

npm start
Backend will run on: http://localhost:10000

3. Frontend Setup

cd frontend

npm install

cp .env.example .env
Edit .env:

 REACT_APP_API_URL=http://localhost:10000

npm start

Frontend will run on: http://localhost:3000

📚 API Endpoints

Authentication

text
POST   /api/auth/register        - Register new user

POST   /api/auth/login           - Login user

Users

GET    /api/users/:userId        - Get user profile

PUT    /api/users/:userId/follow - Follow/Unfollow user

GET    /api/users/search/:query  - Search users

PUT    /api/users/update         - Update profile

Posts

GET    /api/posts                - Get feed (posts from followed users)

POST   /api/posts                - Create post

PUT    /api/posts/:postId/like   - Like/Unlike post

POST   /api/posts/:postId/comment - Add comment

DELETE /api/posts/:postId        - Delete post

Messages

GET    /api/messages             - Get conversations

GET    /api/messages/:userId     - Get conversation with user

POST   /api/messages             - Send message

Notifications

GET    /api/notifications        - Get notifications

PUT    /api/notifications/:id/read - Mark as read

🌐 Live Demo
Frontend: https://snapsphere1.netlify.app/


# 🎨 UI/UX Features
Clean and intuitive interface

Material-UI components

Smooth animations

Loading states

Error handling and user feedback

Responsive sidebar navigation

Real-time badge updates

Image preview on upload


# 📖 Usage Guide

Register & Login

Go to the app

Click "Sign Up" to create account

Enter name, username, email, password

Login with credentials

Create Post
Click "Create" in sidebar

Add image and caption

Click "Post"

Follow Users
Go to "Search"

Find user

Click "Follow"

See their posts in feed

Send Message
Go to "Messages"

Find or search user

Click to open conversation

Type message and send

View Notifications
Click notification bell

See all notifications

Click to view details

# 👨‍💻 Author
Paras adKurkar

GitHub: @Parasadkurkar

Project: SnapSphere

If you find this project helpful, please star it! ⭐
