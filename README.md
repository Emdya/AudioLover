
# AudioLover

A music discovery app built with React Native and Expo. Swipe through songs to find your next favorite track!

## Current Status

**Frontend + Firebase Integration** - The UI/UX is complete and Firebase Firestore is integrated for data persistence. User swipes are now saved to the cloud. Currently uses mock song data - Spotify API integration coming next.

## Branch

`feature/firebase-storage-ep-v1`

## What Works Now

- Swipe RIGHT (green heart) - Saves full song data to Firebase `hiddenGems`
- Swipe LEFT (red X) - Saves song ID to Firebase `skipped`
- Swipe UP (gray check) - Saves song ID to Firebase `alreadyLiked`
- Data persists even after closing the app
- Hidden Gems playlist loads from Firebase on app start

## Firebase Database Structure

```
users/
  default-user/
    hiddenGems: [
      {
        id: "1",
        title: "Midnight Drive",
        artist: "The Night Runners",
        album: "Urban Dreams",
        genre: "Synthwave",
        imageUrl: "https://...",
        previewUrl: "https://..."
      }
    ]
    skipped: ["4", "2"]
    alreadyLiked: ["2", "1"]
    createdAt: "2025-11-26T16:54:19.061Z"
```

## Features

- Swipeable Cards - Tinder-style card swiping for music discovery
- Skip (swipe left) - Songs you don't like
- Already Like (swipe up) - Songs you've heard before
- Hidden Gem (swipe right) - New songs you love, saved to your playlist
- Audio Playback - Preview songs with play/pause controls
- Animated UI - Dynamic gradient background with smooth animations
- Help Tutorial - Built-in guide explaining how to use the app
- Firebase Persistence - All swipes saved to cloud database

## Getting Started

### Prerequisites

- Node.js (v16 or newer) - https://nodejs.org/
- Expo Go app on your phone (iOS or Android) - https://expo.dev/client
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Emdya/AudioLover.git
   cd AudioLover
   ```

2. Checkout this branch
   ```bash
   git checkout feature/firebase-storage-ep-v1
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Start the development server
   ```bash
   npx expo start
   ```

5. Run on your device
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `i` for iOS simulator / `a` for Android emulator

## Project Structure

```
AudioLover/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Tab navigation config
│   │   └── index.tsx      # Main music swiper screen (with Firebase)
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Contributors modal
├── services/
│   ├── firebaseConfig.ts  # Firebase connection
│   └── firebaseStorage.ts # Save/load functions for user data
├── assets/
│   └── fonts/             # Custom fonts
├── components/            # Reusable components
├── constants/
│   └── Colors.ts          # Color theme
├── app.json               # Expo config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Firebase Functions Available

```typescript
// Initialize user (called on app start)
initializeUser()

// Save actions
saveHiddenGem(song)      // Save full song to Hidden Gems
saveSkipped(songId)      // Save skipped song ID
saveAlreadyLiked(songId) // Save already liked song ID

// Retrieve data
getHiddenGems()          // Get all Hidden Gems
getSkipped()             // Get all skipped song IDs
getAlreadyLiked()        // Get all already liked song IDs
getUserData()            // Get all user data at once

// Other
removeHiddenGem(songId)  // Remove song from Hidden Gems
clearUserData()          // Clear all data (for testing)
```

## Tech Stack

- React Native - Mobile app framework
- Expo - Development platform
- TypeScript - Type safety
- Firebase Firestore - Cloud database
- React Native Reanimated - Smooth animations
- React Native Gesture Handler - Swipe gestures
- Expo AV - Audio playback
- Expo Blur - Blur effects
- Expo Linear Gradient - Gradient backgrounds
- Lucide React Native - Icons

## How to Use

1. Play/Pause - Tap the play button on the card to preview the song
2. Skip - Swipe left or tap the red X button
3. Already Like - Swipe up or tap the gray checkmark button
4. Hidden Gem - Swipe right or tap the green heart button
5. View Playlist - Tap "Hidden Gems" to see your saved songs
6. Help - Tap the ? button for a tutorial

## Remaining Deliverables

### Deliverable 1: Spotify API and Python Backend
**Branch:** `feature/backend-spotify-api-yourInitials-versionNum`
- Set up Python Flask server
- Set up Spotify Developer account and get API credentials
- Create endpoint to fetch songs with metadata
- Create endpoint to get song recommendations

### Deliverable 3: Recommendation Logic
**Branch:** `feature/recommendations-yourInitials-versionNum`
- Create Python endpoint that takes user's Firebase data
- Filter out skipped and already liked songs
- Score songs based on different parameters
- Return sorted list of recommended songs

## Contributing

1. Create a new branch from this one
   ```bash
   git checkout feature/firebase-storage-ep-v1
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit and push
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push -u origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub

## Team

Built by the AudioLover team

## License

MIT License
