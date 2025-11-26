

# AudioLover

A music discovery app built with React Native and Expo. Swipe through songs to find your next favorite track!

## Current Status

**Frontend Only** - This is the UI/UX implementation. Backend integration and recommendation algorithm have not been implemented yet. Currently uses mock data for demonstration purposes.

## Features

- Swipeable Cards - Tinder-style card swiping for music discovery
- Skip (swipe left) - Songs you don't like
- Already Like (swipe up) - Songs you've heard before
- Hidden Gem (swipe right) - New songs you love, saved to your playlist
- Audio Playback - Preview songs with play/pause controls
- Animated UI - Dynamic gradient background with smooth animations
- Help Tutorial - Built-in guide explaining how to use the app

## Screenshots

Coming soon!

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

2. Checkout the latest branch
   ```bash
   git checkout feature/frontend-basicDesign-ep-v6
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
│   │   └── index.tsx      # Main music swiper screen
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Contributors modal
├── assets/
│   └── fonts/             # Custom fonts
├── components/            # Reusable components
├── constants/
│   └── Colors.ts          # Color theme
├── app.json               # Expo config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Tech Stack

- React Native - Mobile app framework
- Expo - Development platform
- TypeScript - Type safety
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

## Contributing

1. Create a new branch from `feature/frontend-basicDesign-ep-v6`
   ```bash
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

Backend deliverables · MD
Copy

# AudioLover Backend Deliverables

## Branch Naming Convention

```
feature/[task-name]-[yourInitials]-v[versionNum]
```

Example: `feature/backend-spotify-api-ep-v1`

---

## Deliverable 1: Spotify API and Python Backend

**Branch:** `feature/backend-spotify-api-yourInitials-versionNum`

**Tasks:**
- Set up Python Flask server
- Set up Spotify Developer account and get API credentials
- Create endpoint to fetch songs with metadata
- Create endpoint to get song recommendations

---

## Deliverable 2: Firebase User Data

**Branch:** `feature/firebase-storage-yourInitials-versionNum`

**Tasks:**
- Set up Firebase project
- Create user document structure
- Save Hidden Gems to Firebase
- Save skipped songs to Firebase
- Save Already Liked songs to Firebase
- Fetch user data on app load

---

## Deliverable 3: Recommendation Logic

**Branch:** `feature/recommendations-yourInitials-versionNum`

**Tasks:**
- Create Python endpoint that takes user's Firebase data
- Filter out skipped and already liked songs
- Score songs based on different parameters
- Return sorted list of recommended songs

---

## How to Start Working

1. Clone the repo
   ```bash
   git clone https://github.com/Emdya/AudioLover.git
   cd AudioLover
   ```

2. Get the latest frontend code
   ```bash
   git checkout feature/frontend-basicDesign-ep-v7
   ```

3. Create your branch
   ```bash
   git checkout -b feature/[your-deliverable]-[initials]-v1
   ```

4. Make your changes

5. Commit and push
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push -u origin feature/[your-deliverable]-[initials]-v1
   ```

6. Create a Pull Request on GitHub

---
# AudioLover Backend Deliverables

## Branch Naming Convention

```
feature/[task-name]-[yourInitials]-v[versionNum]
```

Example: `feature/backend-spotify-api-ep-v1`

---

## Deliverable 1: Spotify API and Python Backend

**Branch:** `feature/backend-spotify-api-yourInitials-versionNum`

**Tasks:**
- Set up Python Flask server
- Set up Spotify Developer account and get API credentials
- Create endpoint to fetch songs with metadata
- Create endpoint to get song recommendations

---

## Deliverable 2: Firebase User Data

**Branch:** `feature/firebase-storage-yourInitials-versionNum`

**Tasks:**
- Set up Firebase project
- Create user document structure
- Save Hidden Gems to Firebase
- Save skipped songs to Firebase
- Save Already Liked songs to Firebase
- Fetch user data on app load

---

## Deliverable 3: Recommendation Logic

**Branch:** `feature/recommendations-yourInitials-versionNum`

**Tasks:**
- Create Python endpoint that takes user's Firebase data
- Filter out skipped and already liked songs
- Score songs based on different parameters
- Return sorted list of recommended songs

---

## How to Start Working

1. Clone the repo
   ```bash
   git clone https://github.com/Emdya/AudioLover.git
   cd AudioLover
   ```

2. Get the latest frontend code
   ```bash
   git checkout feature/frontend-basicDesign-ep-v7
   ```

3. Create your branch
   ```bash
   git checkout -b feature/[your-deliverable]-[initials]-v1
   ```

4. Make your changes

5. Commit and push
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push -u origin feature/[your-deliverable]-[initials]-v1
   ```

6. Create a Pull Request on GitHub

---

## Integration Order

1. Firebase setup (Deliverable 2) - needed first for data storage
2. Spotify API (Deliverable 1) - fetch real song data
3. Recommendations (Deliverable 3) - uses Firebase data + Spotify songs
4. Final merge into `feature/backend-complete-v1`

## Team

Built by the AudioLover team

## License

MIT License
