import {
    arrayUnion,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// For now, we'll use a hardcoded user ID
// Later this will come from authentication
const USER_ID = 'default-user';

// Song type
export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  imageUrl: string;
  previewUrl: string;
};

// Initialize user document if it doesn't exist
export const initializeUser = async () => {
  const userRef = doc(db, 'users', USER_ID);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      hiddenGems: [],
      skipped: [],
      alreadyLiked: [],
      createdAt: new Date().toISOString()
    });
  }
};

// Save a song to Hidden Gems
export const saveHiddenGem = async (song: Song) => {
  const userRef = doc(db, 'users', USER_ID);
  await updateDoc(userRef, {
    hiddenGems: arrayUnion(song)
  });
};

// Remove a song from Hidden Gems
export const removeHiddenGem = async (songId: string) => {
  const userRef = doc(db, 'users', USER_ID);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const hiddenGems = userSnap.data().hiddenGems || [];
    const updatedGems = hiddenGems.filter((song: Song) => song.id !== songId);
    await updateDoc(userRef, { hiddenGems: updatedGems });
  }
};

// Get all Hidden Gems
export const getHiddenGems = async (): Promise<Song[]> => {
  const userRef = doc(db, 'users', USER_ID);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data().hiddenGems || [];
  }
  return [];
};

// Save a skipped song ID
export const saveSkipped = async (songId: string) => {
  const userRef = doc(db, 'users', USER_ID);
  await updateDoc(userRef, {
    skipped: arrayUnion(songId)
  });
};

// Get all skipped song IDs
export const getSkipped = async (): Promise<string[]> => {
  const userRef = doc(db, 'users', USER_ID);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data().skipped || [];
  }
  return [];
};

// Save an already liked song ID
export const saveAlreadyLiked = async (songId: string) => {
  const userRef = doc(db, 'users', USER_ID);
  await updateDoc(userRef, {
    alreadyLiked: arrayUnion(songId)
  });
};

// Get all already liked song IDs
export const getAlreadyLiked = async (): Promise<string[]> => {
  const userRef = doc(db, 'users', USER_ID);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data().alreadyLiked || [];
  }
  return [];
};

// Get all user data at once
export const getUserData = async () => {
  const userRef = doc(db, 'users', USER_ID);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return {
      hiddenGems: userSnap.data().hiddenGems || [],
      skipped: userSnap.data().skipped || [],
      alreadyLiked: userSnap.data().alreadyLiked || []
    };
  }
  return {
    hiddenGems: [],
    skipped: [],
    alreadyLiked: []
  };
};

// Clear all user data (for testing)
export const clearUserData = async () => {
  const userRef = doc(db, 'users', USER_ID);
  await setDoc(userRef, {
    hiddenGems: [],
    skipped: [],
    alreadyLiked: [],
    createdAt: new Date().toISOString()
  });
};