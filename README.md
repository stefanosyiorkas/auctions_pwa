# auctions_pwa

## Overview
A full-stack Auction Progressive Web App (PWA) with a modern, responsive UI and secure backend.

## Features Implemented

### Frontend
- Modern, responsive UI using React and Bootstrap
- Login and Register forms with tab navigation
- Toast notifications for all user feedback (success, error, info)
- Continue as Guest option (guest users have limited access)
- Form validation and error handling

### Backend
- Spring Boot REST API
- JWT authentication (secure, with proper secret management)
- User registration and login endpoints
- Role support: Registered users (seller, bidder) and guest users

### DevOps
- Dockerized frontend and backend
- Docker Compose for multi-container orchestration
- Proper .gitignore for Node, Java, Docker, and OS files

## Getting Started
1. Clone the repository
2. Run `docker compose up --build` to start both frontend and backend
3. Access the app at `http://localhost:3000`

## Project Structure
- `frontend/` — React app (UI, authentication, guest mode)
- `backend/` — Spring Boot app (API, JWT, user management)

---
Feel free to extend this README with setup, usage, and contribution instructions as the project grows.