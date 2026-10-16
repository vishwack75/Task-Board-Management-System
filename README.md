# Task Management Board System

A modern full-stack task management and  board application built with React, Vite, Tailwind CSS, Express, and MongoDB.
It enables real-time project organization, team board collaboration, drag-and-drop workflows, and secure cookie-based authentication.

---

## Running Setup Steps

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 2. Server Setup
```bash
# 1. Navigate to the server folder
cd server

# 2. Install dependencies
npm install

# 3. Configure environment variables (create .env based on .env.example)
cp .env.example .env

# 4. Start the backend development server
npm run dev
# Server runs on: http://localhost:5000
```

### 3. Client Setup
```bash
# 1. Navigate to the client folder (in a new terminal)
cd client

# 2. Install dependencies
npm install

# 3. Start the frontend development server
npm run dev
# Client runs on: http://localhost:5173
```

---

## API Endpoints

Base URL: `/api`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & set token cookie | No |
| `POST` | `/api/auth/logout` | Clear auth token cookie & session | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |
| `POST` | `/api/auth/forgot-password` | Send password reset email link | No |
| `POST` | `/api/auth/reset-password` | Reset password using valid reset token | No |

### 2. User Profile (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/user/profile` | Get current user's profile details | Yes |
| `PUT` | `/api/user/profile` | Update profile information (name) | Yes |
| `POST` | `/api/user/avatar` | Upload and update profile avatar image | Yes |
| `PUT` | `/api/user/change-password` | Change user password | Yes |

### 3. Boards (`/api/boards`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/boards` | Create a new board | Yes |
| `GET` | `/api/boards` | Get all owned and shared boards | Yes |
| `GET` | `/api/boards/:id` | Get details and columns of a single board | Yes |
| `PUT` | `/api/boards/:id` | Update board title, description, or color | Yes |
| `DELETE`| `/api/boards/:id` | Delete board and its associated tasks | Yes |
| `POST` | `/api/boards/:id/share` | Invite team member by email (viewer/editor) | Yes |
| `DELETE`| `/api/boards/:id/members/:email` | Remove member from shared board | Yes |

### 4. Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/tasks` | Create a new task in a board | Yes |
| `GET` | `/api/tasks` | Get tasks with optional filters (`boardId`, `priority`, `dueDate`, `search`) | Yes |
| `GET` | `/api/tasks/:id` | Get single task by ID | Yes |
| `PUT` | `/api/tasks/:id` | Update task details (title, column, priority, status) | Yes |
| `DELETE`| `/api/tasks/:id` | Delete task from board | Yes |
| `PATCH`| `/api/tasks/reorder` | Reorder tasks across columns | Yes |

### 5. Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Get aggregated metrics (total boards, tasks, completion rates) | Yes |