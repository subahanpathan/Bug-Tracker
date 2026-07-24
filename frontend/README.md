# Bug Tracker Frontend

Professional Bug Tracking System Frontend built with React, Tailwind CSS, and modern tools.

## Features

- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🔐 Authentication (Login/Register)
- 📊 Dashboard for bug overview
- 🐛 Create, view, and manage bugs
- 💬 Comment system for collaboration
- 📎 File attachments (coming soon)
- 🎯 Filter and search bugs
- 📱 Mobile-friendly design
- ⚡ Fast and optimized with Vite

## Tech Stack

- **React** 18+ - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - API client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **Vite** - Build tool

## Installation

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL and Supabase credentials

## Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

The application will start on `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── store/          # Zustand stores
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies
```

## Key Pages

- **Login/Register** - User authentication
- **Dashboard** - Overview of all bugs
- **Projects** - Manage projects
- **Bug Create** - Create new bugs
- **Bug Detail** - View and edit bug details with comments

## API Integration

The frontend communicates with the backend API at the configured `VITE_API_URL`. Authentication is handled via JWT tokens stored in localStorage.

## Security

- JWT token-based authentication
- Automatic token refresh on API errors
- CORS-protected requests
- Input validation on forms
- Secure password handling
