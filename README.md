# 🐛 Bug Tracker - Professional Issue Management System

A comprehensive **Jira-like** bug tracking and project management application built with **React**, **Express.js**, **Supabase**, and **Socket.io**. 

Deployed live: **Backend on Render** + **Frontend on Vercel** ✨

- 📍 **Backend**: https://bug-tracker1-lzke.onrender.com/api
- 📍 **Frontend**: https://tracker-issue-xyz.vercel.app (auto-deployed from GitHub)

## 🎯 Overview

Bug Tracker is a comprehensive, **production-ready**, enterprise-grade issue and bug tracking system with:
- ✅ Real-time updates with Socket.io
- ✅ Project & team management
- ✅ Advanced kanban board
- ✅ Activity logging & audit trails
- ✅ Email preferences system
- ✅ File attachments with **Secure Streaming**
- ✅ Comment threads
- ✅ **Hardened Security**: BOLA/IDOR protection throughout
- ✅ Role-based permissions

## 🏗️ Architecture & Deployment

```
┌─────────────────────────────────────────────────────────────┐
│           Frontend (React + Vite)                           │
│       Deployed on Vercel (vercel.com)                       │
│    https://tracker-issue-xyz.vercel.app ✅                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│          Backend (Express.js + Node.js)                     │
│      Deployed on Render (render.com)                        │
│  https://bug-tracker1-lzke.onrender.com/api ✅             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API + Socket.io
                         │
┌────────────────────────▼────────────────────────────────────┐
│         Supabase (PostgreSQL)                               │
│    Cloud Database + Row-Level Security                      │
│  https://supabase.com ✅                                    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Status

| Service | Platform | Status | URL |
|---------|----------|--------|-----|
| **Frontend** | Vercel | ✅ Live | https://tracker-issue-xyz.vercel.app |
| **Backend** | Render | ✅ Live | https://bug-tracker1-lzke.onrender.com |
| **Database** | Supabase | ✅ Active | PostgreSQL |
| **GitHub Repo** | GitHub | ✅ Connected | subahanpathan/Bug-Tracker1 |

## 🚀 Tech Stack

### Frontend (Vercel Deployment)
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **TailwindCSS 3** - Utility-first CSS
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **React Beautiful DND** - Drag-and-drop

### Backend (Render Deployment)
- **Node.js** - Runtime
- **Express.js 4** - REST API framework
- **Supabase JS** - Database client
- **Socket.io** - WebSocket communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **CORS** - Cross-origin handling
- **Dotenv** - Environment variables

### Database (Supabase PostgreSQL)
- **PostgreSQL** - Relational database
- **Row-Level Security (RLS)** - Data protection
- **UUID** - Unique identifiers
- **JSONB** - Change tracking & metadata
- **Indexes** - Query optimization
- **Triggers** - Auto-populate functionality
- **12+ tables** - Complete schema

## 📁 Project Structure

```
BUG TRACKER/
├── backend/
│   ├── config/
│   │   └── supabase.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── bugRoutes.js
│   │   ├── userRoutes.js
│   │   ├── commentRoutes.js
│   │   └── attachmentRoutes.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Alert.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── BugCreatePage.jsx
│   │   │   └── BugDetailPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bugService.js
│   │   │   └── projectService.js
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── README.md
│
└── docs/
    ├── SETUP_GUIDE.md
    └── API_DOCS.md
```

## 🔑 Core Features

### Phase 1: Foundation ✅
- ✅ User registration & login with JWT
- ✅ Project creation & management
- ✅ Team member management with roles
- ✅ Role-based access control (Owner, Admin, Developer, Viewer)
- ✅ Bug/issue creation & tracking
- ✅ Priority levels (Low, Medium, High, Critical)
- ✅ Status tracking (Open, In Progress, Resolved, Closed)
- ✅ Issue type classification (Bug, Feature, Task, Enhancement)
- ✅ Mobile-responsive design

### Phase 2: Real-time & Advanced ✅
- ✅ Kanban board with drag-and-drop
- ✅ Real-time updates with Socket.io
- ✅ Live notifications
- ✅ Advanced filtering system
- ✅ File attachments
- ✅ Comment threads with activity tracking
- ✅ User profile management
- ✅ Real-time presence detection

### Phase 3: Email & Activity ✅
- ✅ Activity logging (complete audit trail)
- ✅ Email preference system (user-configurable)
- ✅ 7 notification types:
  - Bug Created
  - Bug Status Changed
  - Bug Assigned to Me
  - Comment on Bug
  - File Attached
  - Team Member Added
  - Settings Updated
- ✅ Activity timeline with change tracking
- ✅ JSONB-based change logging
- ✅ Email service (Mock + SendGrid ready)
- ✅ User activity feed

## 📊 Database Schema

### Tables
1. **Users** - User accounts and profiles
2. **Projects** - Project management
3. **Bugs** - Bug/issue records
4. **Comments** - Bug discussions
5. **Attachments** - File storage
6. **Activity Logs** - Audit trail (optional)

See `database/README.md` for detailed schema documentation.

## 🔐 Security Features

- **BOLA/IDOR Protection** - Granular permission checks on all project/ticket IDs
- **Secure Attachment Streaming** - Authorized file access replacing insecure static folders
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Strict origin whitelist from environment variables
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - Sanitization on all inputs
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Helmet.js headers
- **HTTPS Ready** - Production-ready SSL support

## 🌐 Access Live Application

🎉 **The application is now live!**

### Live URLs
- **Frontend**: https://tracker-issue-xyz.vercel.app
- **Backend API**: https://bug-tracker1-lzke.onrender.com/api
- **GitHub Repository**: https://github.com/subahanpathan/Bug-Tracker1

### Quick Start (Live)
1. Open https://tracker-issue-xyz.vercel.app
2. Click "Sign Up" to create account
3. Create a project
4. Start tracking bugs!

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (free at supabase.com)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/subahanpathan/Bug-Tracker1.git
cd "Bug Tracker"
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "SUPABASE_URL=your_url
SUPABASE_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/" > .env

# Start backend
npm run dev
# Runs on http://localhost:5000
```

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend
npm install

# Start frontend
npm run dev
# Opens at http://localhost:3000
```

### Step 4: Access Application
Open http://localhost:3000 in your browser

---

## 🔧 Deployment Instructions

### Deploy Backend to Render

1. Go to https://render.com/dashboard
2. **New** → **Web Service**
3. **Connect Repository**: Select `Bug-Tracker1`
4. **Configure**:
   - Name: `bug-tracker1`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Environment Variables** (copy from your `.env`):
   ```
   SUPABASE_URL=
   SUPABASE_KEY=
   SUPABASE_SERVICE_KEY=
   JWT_SECRET=
   JWT_EXPIRE=7d
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   MAX_FILE_SIZE=5242880
   # UPLOAD_DIR= (Now using protected streaming, no longer public)
   ```
6. Click **Deploy**
7. ⏳ Wait 5-10 minutes
8. ✅ Get your Render URL (e.g., `https://bug-tracker1-lzke.onrender.com`)

### Deploy Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. **Add New** → **Project**
3. **Import Git Repository**: Select `Bug-Tracker1`
4. **Configure**:
   - Root Directory: `frontend`
   - Framework: `Other` (Vite)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL` = `https://bug-tracker1-lzke.onrender.com/api`
6. Click **Deploy**
7. ⏳ Wait 3-5 minutes
8. ✅ Get your Vercel URL (e.g., `https://tracker-issue-xyz.vercel.app`)

### Final Step: Update Backend CORS

1. Go back to **Render** → **bug-tracker1**
2. **Settings** → **Environment Variables**
3. Update: `CORS_ORIGIN=https://your-vercel-url.vercel.app`
4. **Save** → **Manual Deploy**

**✅ You're live!**

## 📝 Environment Variables

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
```

## 📈 Performance

- **Frontend**: Optimized with Vite and React
- **Backend**: Express.js with efficient middleware
- **Database**: Indexed queries and RLS policies
- **API**: RESTful design with proper caching headers

## 🧪 Testing

### Manual Testing
- Register new account
- Create project
- Create bug
- Add comments
- Filter and search
- Update bug status

### Automated Testing (Coming Soon)
- Jest unit tests
- Integration tests
- E2E tests with Cypress

## 📱 Responsive Design

- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔄 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Kanban board view (Drag & Drop)
- [ ] Advanced filtering and saved filters
- [ ] Bulk operations
- [ ] Email notifications
- [ ] Activity timeline
- [ ] Integration with GitHub/GitLab
- [ ] Two-factor authentication
- [ ] Dark mode toggle
- [ ] Export reports (PDF, CSV)

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 💬 Support

- Check the README files in backend and frontend
- Review API documentation
- Check Supabase documentation
- Open an issue for bugs

## 👨‍💼 Project by

Created as a professional, production-ready Bug Tracker system similar to Jira.

---

**Built with ❤️ for professional teams**
#
