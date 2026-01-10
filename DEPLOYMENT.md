# Deployment Guide

Hosting your AMU Dorm System involves deploying three distinct components:
1.  **Database** (MySQL)
2.  **Backend API** (Node.js/Express)
3.  **Frontend** (Vite/Static)

Here is a recommended free/low-cost stack using **Railway** (for DB & Backend) and **Vercel** (for Frontend).

## 1. Database & Backend (Railway)
Railway is excellent because it can host both your MySQL database and your Node.js server easily.

### Steps:
1.  Create an account at [Railway.app](https://railway.app/).
2.  **Create Database**:
    -   Click "New Project" -> "Provision MySQL".
    -   Once created, go to the "Variables" tab to see your `MYSQL_URL` or individual credentials (Host, User, Password, DB Name).
3.  **Deploy Backend**:
    -   Install the Railway CLI or connect your GitHub repository (Recommended).
    -   If using GitHub: Push your `amu-dorm-system` code to GitHub.
    -   In Railway, click "New" -> "GitHub Repo" -> Select your repo.
    -   **Important**: You need to tell Railway to look in the `server` folder.
        -   Go to "Settings" -> "Root Directory" -> set to `/server`.
    -   **Environment Variables**:
        -   Go to "Variables".
        -   Add key: `DB_HOST`, value: (from MySQL service)
        -   Add key: `DB_USER`, value: (from MySQL service)
        -   Add key: `DB_PASS`, value: (from MySQL service)
        -   Add key: `DB_NAME`, value: (from MySQL service)
        -   Add key: `PORT`, value: `5000` (or let Railway assign one).
4.  **Get Backend URL**:
    -   Once deployed, Railway will provide a public URL (e.g., `https://amu-dorm-server-production.up.railway.app`). Copy this.

## 2. Frontend (Vercel)
Vercel is optimized for Vite projects.

### Steps:
1.  Create an account at [Vercel](https://vercel.com/).
2.  Install Vercel CLI (`npm i -g vercel`) or use the web dashboard.
3.  **Deploy via Web**:
    -   Click "Add New..." -> "Project".
    -   Import your GitHub repository.
    -   **Build Settings**: verify Framework Preset is "Vite".
    -   **Environment Variables**:
        -   Add key: `VITE_API_URL`
        -   Value: Your Railway Backend URL (e.g., `https://amu-dorm-server-production.up.railway.app`) **WITHOUT** the trailing slash.
4.  Click "Deploy".

## 3. Post-Deployment
-   **Initialize Database**: You made need to run the `init-db` script or rely on Sequelize `sync` which runs on server start. Since `server.js` has `sequelize.sync({ alter: true })`, the tables will be created automatically when the backend starts!
-   **Seed Data**: You might start with an empty DB. You can create a new route to seed data or manually run SQL queries via your hosting provider's dashboard.

## Local Development vs Production
-   **Local**: Uses `http://localhost:5000` (default fallback).
-   **Production**: Uses `VITE_API_URL` environment variable.
