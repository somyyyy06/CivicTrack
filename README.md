# CivicTrack - Community Issue Reporting Platform

A full-stack hyper-local civic issue reporting and tracking platform built with React, TypeScript, Express.js, and modern web technologies.

## 🎯 Project Overview

CivicTrack enables citizens to report and track local community issues within their neighborhood (3-5 km radius). The platform focuses on location-based visibility, ensuring users only see and interact with issues relevant to their area.

## ✨ Key Features

### 🌍 Location-Based Filtering

- **GPS Integration**: Automatically detects user location in India
- **Radius-Based Visibility**: Only shows issues within 3-5 km of user's location
- **Dynamic City Detection**: Automatically identifies current city
- **Location Validation**: Ensures users are within India boundaries

### 📱 User Features

- **Quick Issue Reporting**: Title, description, photos, category selection
- **Anonymous Reporting**: Option to report issues anonymously
- **Interactive Map**: Visual representation of issues with Mapbox integration
- **Status Tracking**: Real-time updates on issue resolution progress
- **Voting System**: Upvote/downvote issues for community validation

### 🗺️ Map & Navigation

- **Interactive Map View**: Google Maps-like interface with Mapbox GL JS
- **Issue Markers**: Color-coded markers based on issue status
- **Location Controls**: Radius selection and location refresh
- **Filter Controls**: Filter by category, status, and distance

### 🔧 Admin Features

- **Issue Management**: Review, update status, and manage flagged issues
- **Analytics Dashboard**: View statistics and trends
- **Moderation Tools**: Handle spam and inappropriate reports

## 🏗️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router DOM** for navigation
- **Mapbox GL JS** for interactive maps
- **React Hook Form** with Zod validation

### Backend

- **Express.js** with Node.js
- **CORS** for cross-origin requests
- **UUID** for unique ID generation
- **In-memory data storage** (ready for database integration)

### State Management

- **React Context API** for global state
- **Custom Hooks** for location and issue management
- **API Integration** with backend endpoints

### Development Tools

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Nodemon** for backend development

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/somyyyy06/QuickDesk.git
   cd QuickDesk
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

5. **Start the frontend (in a new terminal)**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

### Environment Setup

Create a `.env` file in the server directory:

```env
PORT=3000
NODE_ENV=development
```

## 📁 Project Structure

```
QuickDesk/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── issues/     # Issue-related components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── maps/       # Map and location components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── package.json
│   └── requirements.txt
├── server/                 # Backend Express API
│   ├── index.js           # Main server file
│   ├── package.json
│   └── requirements.txt
├── README.md
└── requirements.txt        # Project overview requirements
```

## 🎨 Features in Detail

### Issue Categories

- **Roads**: Potholes, road damage, traffic issues
- **Lighting**: Street light problems
- **Water**: Pipeline leaks, water supply issues
- **Cleanliness**: Garbage, sanitation problems
- **Public Safety**: Traffic signals, safety hazards
- **Obstructions**: Fallen trees, blocked pathways

### Issue Status Flow

1. **Open**: Newly reported issue
2. **In Progress**: Work has begun
3. **Resolved**: Issue has been fixed

### Location Services

- **GPS Detection**: Automatic location detection
- **India Validation**: Ensures location is within India
- **City Detection**: Automatically identifies current city
- **Radius Filtering**: Configurable distance-based filtering

## 🔧 Development

### Available Scripts

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### API Endpoints

**Authentication:**

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

**Issues:**

- `GET /api/issues` - Fetch all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get specific issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

**Health:**

- `GET /api/health` - Health check

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 🚧 Current Status

### ✅ Completed

- [x] Full-stack application with frontend and backend
- [x] Frontend UI with React + TypeScript
- [x] Interactive map with Mapbox integration
- [x] Location-based filtering and GPS detection
- [x] Issue reporting and management system
- [x] Admin dashboard and moderation tools
- [x] Responsive design for mobile/desktop
- [x] Error handling and user feedback
- [x] India-specific demo data
- [x] Express.js backend API
- [x] Authentication system
- [x] CRUD operations for issues
- [x] Frontend-backend integration
- [x] Real-time data synchronization

### 🚧 In Progress

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] File upload functionality
- [ ] JWT authentication
- [ ] Input validation middleware

### 📋 Planned

- [ ] Push notifications
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mapbox** for mapping services
- **Shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **Express.js** for robust backend API
- **React Community** for excellent documentation and tools

---

**Built with ❤️ for better communities**
