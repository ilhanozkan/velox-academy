# Overview

https://github.com/user-attachments/assets/f06f87ed-5144-4b04-b7b1-9c8910569902

# Velox Academy

Velox Academy is a comprehensive online learning platform designed for technical training with hands-on sandbox environments. The platform provides interactive coding experiences with real-time virtual machines, making it ideal for cybersecurity, web development, data science, and database management courses.

## 🏗️ Architecture

The project consists of three main components:

- **Backend**: Node.js/Express API server with PostgreSQL database
- **Frontend**: Next.js React application with Mantine UI
- **VM Image**: Virtual machine service for sandbox environments

## 🚀 Features

- **Interactive Learning**: Step-by-step instructions with hands-on coding exercises
- **Sandbox Environments**: Real-time virtual machines powered by Google Cloud Platform
- **Course Management**: Organized categories, trainings, chapters, and achievements
- **User Management**: Authentication, progress tracking, and user sandboxes
- **Admin Dashboard**: Content management and user administration
- **Real-time Terminal**: In-browser terminal access to virtual environments

## 📁 Project Structure

```
velox-academy/
├── backend/           # Express.js API server
│   ├── app/          # Main application code
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Database models (Objection.js)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── umlDiagram.puml  # System architecture diagram
├── frontend/         # Next.js React application
│   └── app/          # Next.js app directory
│       └── src/      # Source code
└── vm-image/         # Virtual machine service
    ├── database/     # VM database setup
    └── user/         # User environment files
```

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Objection.js with Knex.js
- **Authentication**: JWT with bcrypt
- **Cloud Services**: Google Cloud Platform (Compute Engine, Storage)
- **File Upload**: Multer
- **Containerization**: Docker

### Frontend

- **Framework**: Next.js 14
- **UI Library**: Mantine
- **State Management**: Redux Toolkit
- **Code Editor**: Monaco Editor
- **Terminal**: XTerm.js
- **HTTP Client**: Axios
- **Styling**: CSS Modules with PostCSS

### VM Service

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time Communication**: Socket.io
- **Process Management**: node-pty
- **Database**: MySQL2
- **File Watching**: Chokidar

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL
- Google Cloud Platform account (for VM services)

### Installation

**Clone the repository**

```bash
git clone <repository-url>
cd velox-academy
```

### Running with Docker

1. **Create Docker network**

   ```bash
   docker network create velox-network
   ```

2. **Start Backend Services**

   ```bash
   cd backend/app
   docker-compose up -d
   ```

3. **Start Frontend**

   ```bash
   cd frontend
   make dev
   ```

4. **Start VM Service (for creating example SQL sandboxes images)**
   ```bash
   cd vm-image
   docker-compose up -d
   ```

### Running Locally

1. **Start PostgreSQL database**

2. **Start Backend**

   ```bash
   cd backend/app
   npm start
   ```

3. **Start Frontend**

   ```bash
   cd frontend/app
   npm run dev
   ```

4. **Start VM Service**
   ```bash
   cd vm-image
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective directories:

**Backend (`backend/app/.env`)**:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/velox
JWT_SECRET=your-jwt-secret
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

**Frontend (`frontend/app/.env.local`)**:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Google Cloud Setup

1. Create a Google Cloud Project
2. Enable Compute Engine API
3. Create a service account with appropriate permissions
4. Download credentials JSON file
5. Place credentials in `backend/app/application_default_credentials.json`

## 📊 Database Schema

The platform uses a relational database with the following main entities:

- **Users**: User accounts and authentication
- **Categories**: Course categories (e.g., Cybersecurity, Web Dev)
- **Trainings**: Individual courses within categories
- **Chapters**: Course sections with content
- **Instructions**: Step-by-step learning content
- **Sandboxes**: Virtual environment configurations
- **WriteUps**: Student submissions and documentation
- **Achievements**: Progress tracking and badges

## 🔗 API Endpoints

The backend provides RESTful APIs for:

- `/api/auth` - Authentication (login, register, logout)
- `/api/users` - User management
- `/api/categories` - Course categories
- `/api/trainings` - Course management
- `/api/chapters` - Chapter content
- `/api/instructions` - Learning instructions
- `/api/sandboxes` - Virtual environments
- `/api/achievements` - Progress tracking
- `/api/admin` - Administrative functions

## 🎯 Key Features

### Learning Management

- Structured courses with categories and chapters
- Progressive learning with step-by-step instructions
- Achievement system for motivation
- Progress tracking and analytics

### Sandbox Environments

- On-demand virtual machine creation
- Real-time terminal access in browser
- File system management
- Database environments for practice

### User Experience

- Modern, responsive UI with Mantine components
- Code editor with syntax highlighting
- Real-time collaboration features

---

Built with ❤️ for interactive technical education
