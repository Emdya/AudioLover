import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  Heart,
  HelpCircle,
  Pause,
  Play,
  RefreshCw,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import AnimatedReanimated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ContributorsModal from '../modal';

// Firebase imports
import {
  getHiddenGems,
  initializeUser,
  saveAlreadyLiked,
  saveHiddenGem,
  saveSkipped,
  Song,
} from '../../services/firebaseStorage';

const MUSIC_FACTS = [
  "The world's longest concert lasted 453 hours...",
  "Spotify has over 100 million songs...",
  "The most expensive musical instrument sold for $16 million...",
  "Mozart wrote his first symphony at age 8...",
  "Vinyl records are making a comeback...",
  "The average song length has decreased by 30 seconds since 2000...",
  "Music can increase workout performance by 15%...",
  "The first music video on MTV was 'Video Killed the Radio Star'...",
  "Listening to music releases dopamine in your brain...",
  "The Beatles hold the record for most #1 hits...",
  "Finland has the most metal bands per capita...",
  "The longest recorded pop song is over 1 hour...",
  "Cows produce more milk when listening to slow music...",
  "The most covered song ever is 'Yesterday' by The Beatles...",
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.55;
const SWIPE_THRESHOLD = 100;

// API URL - change this when deploying
const API_URL = 'http://192.168.1.94:5000';

// Song type matching Spotify API response
type SpotifySong = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumImage: string | null;
  previewUrl: string | null;
  popularity: number;
  releaseDate: string;
  explicit: boolean;
  genres: string[];
  durationMs: number;
  spotifyUrl: string;
};

// Fetch songs from our backend API
const fetchSongsFromAPI = async (endpoint: string = '/api/discover?limit=20'): Promise<SpotifySong[]> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    const data = await response.json();
    
    if (data.success && data.tracks) {
      return data.tracks;
    }
    return [];
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
};

// Animated Logo Component
const AnimatedLogo = () => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [slideAnim]);

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <Text style={styles.headerTitle}>AUDIOLOVER</Text>
    </Animated.View>
  );
};

// Help/Tutorial Modal
const HelpModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={styles.helpBackdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.helpModal}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>How to Use</Text>
              <Pressable onPress={onClose} style={styles.helpClose}>
                <X color="white" size={24} />
              </Pressable>
            </View>

            <View style={styles.helpContent}>
              <View style={styles.helpItem}>
                <View style={[styles.helpIcon, { backgroundColor: '#ef4444' }]}>
                  <X color="black" size={24} strokeWidth={3} />
                </View>
                <View style={styles.helpTextContainer}>
                  <Text style={styles.helpButtonTitle}>Skip (Left)</Text>
                  <Text style={styles.helpDescription}>
                    Songs you don't like or want to skip
                  </Text>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={[styles.helpIcon, { backgroundColor: '#6b7280' }]}>
                  <Check color="black" size={24} strokeWidth={3} />
                </View>
                <View style={styles.helpTextContainer}>
                  <Text style={styles.helpButtonTitle}>Already Like (Up)</Text>
                  <Text style={styles.helpDescription}>
                    Songs you like but have already heard before
                  </Text>
                </View>
              </View>

              <View style={styles.helpItem}>
                <View style={[styles.helpIcon, { backgroundColor: '#22c55e' }]}>
                  <Heart color="black" size={24} strokeWidth={3} fill="black" />
                </View>
                <View style={styles.helpTextContainer}>
                  <Text style={styles.helpButtonTitle}>Hidden Gem (Right)</Text>
                  <Text style={styles.helpDescription}>
                    New songs you love! Adds to your Hidden Gems playlist
                  </Text>
                </View>
              </View>

              <View style={styles.helpTip}>
                <Text style={styles.helpTipText}>
                  Tip: You can also swipe cards left, right, or up!
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      })
    ).start();
  }, [animation]);

  const backgroundColor1 = animation.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [
      'rgba(75,0,130,0.4)',
      'rgba(147,51,234,0.5)',
      'rgba(59,130,246,0.45)',
      'rgba(75,0,130,0.4)',
    ],
  });

  const backgroundColor2 = animation.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [
      'rgba(147,51,234,0.35)',
      'rgba(59,130,246,0.4)',
      'rgba(75,0,130,0.35)',
      'rgba(147,51,234,0.35)',
    ],
  });

  const backgroundColor3 = animation.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [
      'rgba(59,130,246,0.3)',
      'rgba(75,0,130,0.3)',
      'rgba(147,51,234,0.35)',
      'rgba(59,130,246,0.3)',
    ],
  });

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: backgroundColor1 }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: backgroundColor2 }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: backgroundColor3 }]} />
    </>
  );
};

const SwipeCard = ({
  song,
  index,
  currentIndex,
  onSwipe,
  isPlaying,
  onTogglePlay,
  onOpenSpotify,
}: {
  song: SpotifySong;
  index: number;
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenSpotify: () => void;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const cardOffset = index - currentIndex;
  const isActive = cardOffset === 0;
  const isNext = cardOffset === 1;
  const isNextNext = cardOffset === 2;

  const onGestureEvent = (event: any) => {
    if (!isActive) return;
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  const onHandlerStateChange = (event: any) => {
    if (!isActive) return;
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;

      const isSwipingVertical = Math.abs(velocityY) > Math.abs(velocityX) && Math.abs(velocityY) > 500;
      const isSwipingHorizontal = Math.abs(velocityX) > Math.abs(velocityY) && Math.abs(velocityX) > 500;

      if (isSwipingVertical && translationY < -SWIPE_THRESHOLD) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(onSwipe)('up');
      } else if (isSwipingHorizontal) {
        if (velocityX > 0) {
          translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
          runOnJS(onSwipe)('right');
        } else {
          translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
          runOnJS(onSwipe)('left');
        }
      } else if (Math.abs(translationY) > SWIPE_THRESHOLD && translationY < 0) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(onSwipe)('up');
      } else if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        if (translationX > 0) {
          translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
          runOnJS(onSwipe)('right');
        } else {
          translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
          runOnJS(onSwipe)('left');
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
  const rotate = interpolate(
    translateX.value,
    [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    [-25, 0, 25],
    Extrapolate.CLAMP
  );

  const opacity = isActive
    ? interpolate(Math.abs(translateX.value), [0, SCREEN_WIDTH / 2], [1, 0.5], Extrapolate.CLAMP)
    : isNext ? 0.7 : 0.4;

  const scale = withSpring(isActive ? 1 : isNext ? 0.94 : 0.88, {
    damping: 15,
    stiffness: 100,
  });
  
  const translateYOffset = withSpring(isActive ? 0 : isNext ? 15 : 30, {
    damping: 15,
    stiffness: 100,
  });

  return {
    transform: [
      { translateX: isActive ? translateX.value : 0 },
      { translateY: isActive ? translateY.value : translateYOffset },
      { rotate: `${isActive ? rotate : 0}deg` },
      { scale },
    ],
    opacity: withSpring(opacity, { damping: 15, stiffness: 100 }),
    zIndex: isActive ? 10 : isNext ? 5 : 0,
  };
});

  const skipOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-150, -50, 0], [1, 0.5, 0], Extrapolate.CLAMP),
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 50, 150], [0, 0.5, 1], Extrapolate.CLAMP),
  }));

  const addOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-150, -50, 0], [1, 0.5, 0], Extrapolate.CLAMP),
  }));

  if (!isActive && !isNext && !isNextNext) return null;

  const genre = song.genres && song.genres.length > 0 ? song.genres[0] : 'Music';

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={isActive}
    >
      <AnimatedReanimated.View style={[styles.cardContainer, animatedStyle]}>
        {isActive && (
          <>
            <AnimatedReanimated.View style={[styles.skipLabel, skipOpacity]}>
              <View style={styles.skipBadge}>
                <Text style={styles.badgeText}>SKIP</Text>
              </View>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View style={[styles.likeLabel, likeOpacity]}>
              <View style={styles.likeBadge}>
                <Text style={styles.badgeText}>ADD</Text>
              </View>
            </AnimatedReanimated.View>

            <AnimatedReanimated.View style={[styles.addLabel, addOpacity]}>
              <View style={styles.alreadyLikeBadge}>
                <Text style={styles.badgeText}>LIKED</Text>
              </View>
            </AnimatedReanimated.View>
          </>
        )}

        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: song.albumImage || 'https://via.placeholder.com/400' }} 
              style={styles.albumImage} 
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
              style={styles.gradient}
            />

            <View style={styles.genreBadge}>
              <BlurView intensity={80} tint="dark" style={styles.blurView}>
                <Text style={styles.genreText}>{genre.toUpperCase()}</Text>
              </BlurView>
            </View>

            

            {isActive && (
              <>
                {song.previewUrl ? (
                  <Pressable onPress={onTogglePlay} style={styles.playButton}>
                    <BlurView intensity={40} tint="dark" style={styles.playButtonBlur}>
                      {isPlaying ? (
                        <Pause color="white" size={32} />
                      ) : (
                        <Play color="white" size={32} style={{ marginLeft: 4 }} />
                      )}
                    </BlurView>
                  </Pressable>
                ) : (
                  <Pressable onPress={onOpenSpotify} style={styles.playButton}>
                    <BlurView intensity={40} tint="dark" style={styles.playButtonBlur}>
                      <Text style={styles.spotifyText}>Open in Spotify</Text>
                    </BlurView>
                  </Pressable>
                )}
              </>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {song.title.toUpperCase()}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {song.artist}
            </Text>
            <Text style={styles.album} numberOfLines={1}>
              {song.album} • {song.releaseDate?.substring(0, 4)}
            </Text>
          </View>
        </View>
      </AnimatedReanimated.View>
    </PanGestureHandler>
  );
};
//Hi
// Loading Screen Component
const LoadingScreen = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [factIndex, setFactIndex] = useState(Math.floor(Math.random() * MUSIC_FACTS.length));
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Float animation (up and down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background animation
    Animated.loop(
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    ).start();

    const interval = setInterval(() => {
      setFactIndex(Math.floor(Math.random() * MUSIC_FACTS.length));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bgColor1 = backgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(139,92,246,0.8)', 'rgba(59,130,246,0.8)', 'rgba(139,92,246,0.8)'],
  });

  const bgColor2 = backgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(59,130,246,0.6)', 'rgba(139,92,246,0.6)', 'rgba(59,130,246,0.6)'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor1 }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor2, opacity: 0.7 }]} />
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        {/* Floating + Spinning Disc */}
        <Animated.View style={{ 
          transform: [{ rotate: spin }, { translateY: floatAnim }], 
          marginBottom: 40 
        }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#1a1a1a',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: '#333',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 15,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#a78bfa',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#1a1a1a' }} />
            </View>
            <View style={{ position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          </View>
        </Animated.View>

        <Text style={{ 
          fontSize: 24, 
          fontWeight: '900', 
          color: '#fff', 
          letterSpacing: 6, 
          fontFamily: 'monospace', 
          marginBottom: 40 
        }}>
          LOADING
        </Text>
        
        <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ 
            fontSize: 11, 
            fontWeight: '800', 
            color: 'rgba(255,255,255,0.4)', 
            letterSpacing: 4, 
            fontFamily: 'monospace', 
            marginBottom: 12 
          }}>
            DID YOU KNOW?
          </Text>
          <Text style={{ 
            fontSize: 18, 
            color: '#fff', 
            textAlign: 'center', 
            fontWeight: '600',
            fontStyle: 'italic',
            lineHeight: 28,
            opacity: 0.95,
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            "{MUSIC_FACTS[factIndex]}"
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function MusicSwiper() {
  const [songs, setSongs] = useState<SpotifySong[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hiddenGems, setHiddenGems] = useState<SpotifySong[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const currentSong = songs[currentIndex];

  // Load songs from API and Firebase on app start
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Initialize Firebase user
        await initializeUser();
        
        // Load Hidden Gems from Firebase
        const gems = await getHiddenGems();
        setHiddenGems(gems as SpotifySong[]);
        
        // Fetch songs from Spotify API
        const spotifySongs = await fetchSongsFromAPI('/api/discover?limit=20');
        
        if (spotifySongs.length === 0) {
          setError('Could not load songs. Make sure the backend server is running.');
        } else {
          setSongs(spotifySongs);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to connect to server. Is the backend running?');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    loadAndPlaySound();
  }, [currentIndex]);

  const loadAndPlaySound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = async () => {
    if (!currentSong?.previewUrl) {
      // Open Spotify if no preview
      if (currentSong?.spotifyUrl) {
        Linking.openURL(currentSong.spotifyUrl);
      }
      return;
    }

    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: currentSong.previewUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const openSpotify = () => {
    if (currentSong?.spotifyUrl) {
      Linking.openURL(currentSong.spotifyUrl);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (!currentSong) return;

    try {
      const songToSave: Song = {
        id: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        genre: currentSong.genres?.[0] || 'Unknown',
        imageUrl: currentSong.albumImage || '',
        previewUrl: currentSong.previewUrl || '',
      };

      if (direction === 'right') {
        await saveHiddenGem(songToSave);
        setHiddenGems([...hiddenGems, currentSong]);
      } else if (direction === 'left') {
        await saveSkipped(currentSong.id);
      } else if (direction === 'up') {
        await saveAlreadyLiked(currentSong.id);
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }

    // Move to next song or fetch more
    setTimeout(() => {
      if (currentIndex < songs.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Fetch more songs when we run out
        loadMoreSongs();
      }
    }, 300);
  };

  const loadMoreSongs = async () => {
    setIsLoading(true);
    const moreSongs = await fetchSongsFromAPI('/api/discover?limit=20');
    if (moreSongs.length > 0) {
      setSongs(moreSongs);
      setCurrentIndex(0);
    }
    setIsLoading(false);
  };

  const handleButtonSwipe = async (direction: 'left' | 'right' | 'up') => {
    await handleSwipe(direction);
  };

  // Loading state
  if (isLoading) {
  return (
    <GestureHandlerRootView style={styles.container}>
      <LoadingScreen />
    </GestureHandlerRootView>
  );
}

  // Error state
  if (error) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <AnimatedBackground />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadMoreSongs}>
            <RefreshCw color="white" size={20} />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
          <Text style={styles.hintText}>
            Run: cd backend && python3 app.py
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AnimatedBackground />

      <View style={styles.header}>
        <AnimatedLogo />
        <View style={styles.headerRight}>
          <Pressable onPress={() => setShowHelp(true)} style={styles.helpButton}>
            <HelpCircle color="#000" size={20} />
          </Pressable>
          <Pressable onPress={() => setShowPlaylist(true)} style={styles.playlistButton}>
            <Heart color="#000" size={16} />
            <Text style={styles.playlistText}>Hidden Gems ({hiddenGems.length})</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {songs.map((song, index) => (
          <SwipeCard
            key={song.id}
            song={song}
            index={index}
            currentIndex={currentIndex}
            onSwipe={handleSwipe}
            isPlaying={isPlaying && index === currentIndex}
            onTogglePlay={togglePlay}
            onOpenSpotify={openSpotify}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={() => handleButtonSwipe('left')}
          style={[styles.actionButton, styles.skipButton]}
        >
          <X color="black" size={28} strokeWidth={3} />
        </Pressable>

        <Pressable
          onPress={() => handleButtonSwipe('up')}
          style={[styles.actionButton, styles.alreadyButton]}
        >
          <Check color="black" size={28} strokeWidth={3} />
        </Pressable>

        <Pressable
          onPress={() => handleButtonSwipe('right')}
          style={[styles.actionButton, styles.gemButton]}
        >
          <Heart color="black" size={28} strokeWidth={3} fill="black" />
        </Pressable>
      </View>

      <ContributorsModal />
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      <Modal visible={showPlaylist} animationType="slide" transparent={false}>
        <View style={styles.playlistModal}>
          <View style={styles.playlistHeader}>
            <Text style={styles.playlistTitle}>HIDDEN GEMS</Text>
            <Pressable onPress={() => setShowPlaylist(false)}>
              <X color="#fff" size={24} />
            </Pressable>
          </View>

          <ScrollView style={styles.playlistScroll}>
            {hiddenGems.length === 0 ? (
              <Text style={styles.emptyText}>
                No hidden gems yet. Start swiping right on songs you discover!
              </Text>
            ) : (
              hiddenGems.map((song, index) => (
                <Pressable 
                  key={`${song.id}-${index}`} 
                  style={styles.playlistItem}
                  onPress={() => {
                    if (song.spotifyUrl) {
                      Linking.openURL(song.spotifyUrl);
                    }
                  }}
                >
                  <Image 
                    source={{ uri: song.albumImage || 'https://via.placeholder.com/60' }} 
                    style={styles.playlistImage} 
                  />
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistSongTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.playlistArtist} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a78bfa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playlistText: {
    color: '#000',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  helpBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpModal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  helpClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpContent: {
    gap: 20,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  helpIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextContainer: {
    flex: 1,
  },
  helpButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  helpDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  helpTip: {
    marginTop: 8,
    padding: 16,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  helpTipText: {
    color: '#a78bfa',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  genreBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  popularityBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurView: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  popularityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  playButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.4)',
  },
  spotifyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  volumeIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  volumeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  artist: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  album: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  skipLabel: {
    position: 'absolute',
    left: 30,
    top: '50%',
    marginTop: -25,
    zIndex: 20,
  },
  skipBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    transform: [{ rotate: '-20deg' }],
    borderWidth: 4,
    borderColor: '#f87171',
  },
  likeLabel: {
    position: 'absolute',
    right: 30,
    top: '50%',
    marginTop: -25,
    zIndex: 20,
  },
  likeBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    transform: [{ rotate: '20deg' }],
    borderWidth: 4,
    borderColor: '#4ade80',
  },
  addLabel: {
    position: 'absolute',
    top: 30,
    left: '50%',
    marginLeft: -50,
    zIndex: 20,
  },
  alreadyLikeBadge: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#c084fc',
  },
  badgeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingBottom: 30,
    paddingTop: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    backgroundColor: '#ef4444',
  },
  alreadyButton: {
    backgroundColor: '#6b7280',
  },
  gemButton: {
    backgroundColor: '#22c55e',
  },
  playlistModal: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playlistTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  playlistScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
    fontSize: 16,
    lineHeight: 24,
  },
  playlistItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistSongTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});