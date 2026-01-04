# Yasir Pharmacy & General Store - Project Documentation

## Project Overview
Yasir Pharmacy & General Store is a full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application designed for a modern pharmacy and general store. It features a customer-facing storefront with a premium "neon-glass" design and a comprehensive admin panel for management.

### Key Features
- **Frontend**: Responsive, modern UI with dark mode, neon effects, and smooth animations using Tailwind CSS and Framer Motion.
- **Backend**: Robust REST API with JWT authentication, role-based access control, and image upload capabilities.
- **Admin Panel**: Dedicated dashboard for managing products, categories, orders, and users.
- **Security**: Password hashing, secure token management, and input validation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (installed locally or a cloud URI)

### 1. Setup Backend
1. Navigate to `/backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - Ensure `MONGODB_URI` points to your running MongoDB instance.
   - Default Super Admin credentials are provided in the file.
4. Start the server:
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:5000`.

### 2. Setup Frontend (Storefront)
1. Open a new terminal and navigate to `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`.

### 3. Setup Admin Panel
1. Open a new terminal and navigate to `/admin-panel` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Admin panel will be available at `http://localhost:5174`.

---

## 🔑 Default Credentials

### Super Admin
- **Email**: `admin@yasirpharmacy.com`
- **Password**: `SuperAdmin@123!`

Use these credentials to log in to the Admin Panel (`http://localhost:5174/login`).

---

## 📂 Project Structure

### Backend (`/backend`)
- `models/`: Mongoose schemas (User, Product, Order, etc.)
- `controllers/`: Logic for handling API requests
- `routes/`: API endpoint definitions
- `middleware/`: Auth and error handling middleware
- `config/`: Database and app configuration

### Frontend (`/frontend`)
- `src/pages/`: Main application pages
- `src/components/`: Reusable UI components
- `src/context/`: React context for state management (Auth, Cart, etc.)
- `src/lib/`: Utilities and API client

### Admin Panel (`/admin-panel`)
- Similar structure to frontend, optimized for management tasks.
- `src/pages/`: Dashboard, Products, Users, etc.

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Axios, React Router DOM
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer
- **Tools**: Postman (for API testing), ESLint

---

## 📝 API Endpoints Summary

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Products**: `/api/products` (GET), `/api/products` (POST - Admin)
- **Categories**: `/api/categories`
- **Orders**: `/api/orders` (User), `/api/orders/admin/all` (Admin)
- **Users**: `/api/users` (Admin only)

---

## ⚠️ Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB service is running locally (`mongod`), or update `MONGODB_URI` in `backend/.env` to a valid Atlas connection string.
- **CORS Issues**: If you change ports, update the `cors` configuration in `backend/server.js`.
- **Image Uploads**: Images are stored in `backend/uploads`. Ensure this directory exists and has write permissions.

---

## 🚢 Deployment

1. **Backend**: Can be deployed to Heroku, Railway, or Render. ensuring environment variables are set.
2. **Frontend**: Build using `npm run build` and deploy to Vercel or Netlify.
3. **Admin**: Build using `npm run build` and deploy to Vercel or Netlify (separate project).

Enjoy building with Yasir Pharmacy! 💊🛍️
