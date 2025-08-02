# CivicTrack - Community Issue Reporting Platform

A hyper-local civic issue reporting and tracking platform built with React, TypeScript, and modern web technologies.

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

### State Management

- **React Context API** for global state
- **Custom Hooks** for location and issue management

### Development Tools

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd civictrack-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174`

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── issues/         # Issue-related components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── maps/           # Map and location components
│   └── ui/             # Reusable UI components
├── contexts/           # React Context providers
├── pages/              # Page components
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 🚧 Current Status

### ✅ Completed

- [x] Frontend UI with React + TypeScript
- [x] Interactive map with Mapbox integration
- [x] Location-based filtering and GPS detection
- [x] Issue reporting and management system
- [x] Admin dashboard and moderation tools
- [x] Responsive design for mobile/desktop
- [x] Error handling and user feedback
- [x] India-specific demo data

### 🚧 In Progress

- [ ] Backend API development
- [ ] Database integration
- [ ] Authentication system
- [ ] File upload functionality
- [ ] Real-time updates

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
- **React Community** for excellent documentation and tools

---

**Built with ❤️ for better communities**
