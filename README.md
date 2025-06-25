# Edukins Mobile App

AI-powered interactive tutor for primary school kids - React Native Expo app

## Features

- 📚 Fetch lessons from backend API with JWT authentication
- 🔊 Text-to-Speech audio playback with local caching
- 📱 Responsive design for tablets and phones
- 🎨 Clean UI using React Native Paper
- 🔄 Pull-to-refresh functionality
- ⚡ Automatic audio playback after download
- 🛡️ Error handling for expired JWT and network issues

## Tech Stack

- **React Native** with Expo
- **React Native Paper** for UI components
- **expo-av** for audio playback
- **expo-file-system** for local audio storage
- **axios** for API requests

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
npm run android  # For Android
npm run ios      # For iOS
```

## API Integration

The app connects to the Edukins backend at `http://localhost:5050/api` and uses:

- `GET /lesson/:id` - Fetch lesson data
- `GET /lesson/:id/audio` - Download lesson audio

## Components

- **LessonScreen** - Main screen displaying lesson content
- **LessonCard** - Shows lesson metadata (subject, grade, topic)
- **LessonScript** - Scrollable lesson content
- **LessonAudioPlayer** - Reusable audio player component

## Configuration

Update the demo values in `LessonScreen.js`:
- `DEMO_LESSON_ID` - Lesson ID to fetch
- `DEMO_JWT_TOKEN` - Authentication token

In production, these would come from navigation params or authentication context.