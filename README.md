# AudioLover 🎵

A music discovery app built with React Native and Expo. Swipe through songs to find your next favorite track!

## Current Status

**Spotify API + Firebase Integration Complete** - The app now fetches real songs from Spotify via a Python Flask backend. User swipes are saved to Firebase Firestore for cloud persistence. Includes Deezer fallback for audio previews.

**Branch:** `feature/backend-spotify-api-ep-v1`

## What Works Now

- 🎧 **Real Spotify Songs** - Fetches actual tracks with full metadata
- 🔊 **Audio Previews** - 30-second clips via Deezer API fallback
- 💚 **Swipe RIGHT** - Saves song to Firebase Hidden Gems
- ❌ **Swipe LEFT** - Skips song, saves to Firebase
- ✓ **Swipe UP** - Already liked, saves to Firebase
- ☁️ **Cloud Persistence** - Data syncs across sessions
- 🎸 **Animated Loading** - Spinning vinyl with music facts

## Features

| Feature | Description |
|---------|-------------|
| **Swipeable Cards** | Tinder-style card swiping for music discovery |
| **Real Spotify Data** | Actual songs with album art, artist info, genres |
| **Audio Playback** | 30-second preview clips from Deezer |
| **Animated Loading** | Spinning vinyl disc with rotating music facts |
| **Firebase Sync** | All swipes saved to cloud database |
| **Hidden Gems Playlist** | View and play your saved discoveries |
| **Help Tutorial** | Built-in guide explaining gestures |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Native   │────▶│  Flask Backend  │────▶│   Spotify API   │
│   Expo App      │     │  (Python)       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │   Deezer API    │
        │               │  (Preview URLs) │
        │               └─────────────────┘
        ▼
┌─────────────────┐
│    Firebase     │
│   Firestore     │
└─────────────────┘
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer) - https://nodejs.org/
- Python 3.8+ - https://python.org/
- Expo Go app on your phone - https://expo.dev/client

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Emdya/AudioLover.git
   cd AudioLover
   ```

2. **Checkout the backend branch**
   ```bash
   git checkout feature/backend-spotify-api-ep-v1
   ```

3. **Install frontend dependencies**
   ```bash
   npm install
   ```

4. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   
   Create `backend/.env`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

6. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate
   python app.py
   ```

7. **Start the Expo app** (new terminal)
   ```bash
   npx expo start
   ```

8. **Update API URL**
   
   In `app/(tabs)/index.tsx`, update the API_URL to your computer's IP:
   ```typescript
   const API_URL = 'http://YOUR_IP_ADDRESS:5000';
   ```

## Project Structure

```
AudioLover/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation
│   │   └── index.tsx        # Main swiper screen
│   ├── _layout.tsx          # Root layout
│   └── modal.tsx            # Contributors modal
├── backend/
│   ├── app.py               # Flask API server
│   ├── spotify_service.py   # Spotify + Deezer integration
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # API credentials (not in git)
├── services/
│   ├── firebaseConfig.ts    # Firebase connection
│   └── firebaseStorage.ts   # User data functions
├── assets/
│   └── fonts/               # Custom fonts
├── components/              # Reusable components
├── constants/
│   └── Colors.ts            # Color theme
└── package.json             # Node dependencies
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/discover?limit=20` | Mixed discovery songs |
| `GET /api/genre/<genre>?limit=20` | Songs by genre |
| `GET /api/search?q=query&limit=20` | Search for songs |
| `GET /api/featured?limit=20` | Popular tracks |
| `GET /api/new-releases?limit=20` | Recent releases |
| `GET /api/genres` | List available genres |

## Firebase Functions

```typescript
// Initialize user (called on app start)
initializeUser()

// Save actions
saveHiddenGem(song)      // Save full song to Hidden Gems
saveSkipped(songId)      // Save skipped song ID
saveAlreadyLiked(songId) // Save already liked song ID

// Retrieve data
getHiddenGems()          // Get all Hidden Gems
getSkipped()             // Get all skipped IDs
getAlreadyLiked()        // Get all already liked IDs
getUserData()            // Get all user data

// Other
removeHiddenGem(songId)  // Remove from Hidden Gems
clearUserData()          // Clear all data
```

## How to Use

| Action | Gesture | Button |
|--------|---------|--------|
| **Preview Song** | Tap play button | ▶️ |
| **Skip** | Swipe left | ❌ |
| **Already Like** | Swipe up | ✓ |
| **Hidden Gem** | Swipe right | 💚 |
| **View Playlist** | Tap "Hidden Gems" | - |
| **Get Help** | Tap ? button | ❓ |

## Tech Stack

### Frontend
- React Native + Expo
- TypeScript
- React Native Reanimated
- React Native Gesture Handler
- Expo AV (audio)
- Expo Blur + Linear Gradient

### Backend
- Python Flask
- Spotipy (Spotify API)
- Deezer API (preview fallback)

### Database
- Firebase Firestore

## Deliverables Status

| # | Deliverable | Status | Branch |
|---|-------------|--------|--------|
| 1 | Spotify API + Python Backend | ✅ Complete | `feature/backend-spotify-api-ep-v1` |
| 2 | Firebase Integration | ✅ Complete | `feature/firebase-storage-ep-v1` |
| 3 | Recommendation Logic | 🔄 Pending | - |

## Known Limitations

- Preview URLs limited to 30 seconds (Spotify/Deezer restriction)
- Some songs may not have previews available
- Uses "default-user" (no authentication yet)
- Backend must be running on same network as phone

## Contributing

1. Create a new branch from `feature/backend-spotify-api-ep-v1`
   ```bash
   git checkout feature/backend-spotify-api-ep-v1
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit and push
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push -u origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## Team

Built by the AudioLover team for Code Spring Hackathon 🚀

## License

MIT License
