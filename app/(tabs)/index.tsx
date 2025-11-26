import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  Heart,
  HelpCircle,
  Pause,
  Play,
  Volume2,
  X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
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
  Song
} from '../../services/firebaseStorage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.55;
const SWIPE_THRESHOLD = 100;

type SongWithGenre = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  imageUrl: any;
  previewUrl: string;
  duration: number;
};

const mockSongsWithGenre: SongWithGenre[] = [
  {
    id: '1',
    title: 'Midnight Drive',
    artist: 'The Night Runners',
    album: 'Urban Dreams',
    genre: 'Synthwave',
    imageUrl: { uri: 'https://picsum.photos/seed/neon/400/400' },
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 30,
  },
  {
    id: '2',
    title: 'Electric Soul',
    artist: 'Synthwave Collective',
    album: 'Retro Future',
    genre: 'Electronic',
    imageUrl: { uri: 'https://picsum.photos/seed/synth/400/400' },
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 30,
  },
  {
    id: '3',
    title: 'Ocean Waves',
    artist: 'Ambient Dreams',
    album: 'Natural Sounds',
    genre: 'Ambient',
    imageUrl: { uri: 'https://picsum.photos/seed/ocean/400/400' },
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 30,
  },
  {
    id: '4',
    title: 'Jazz Café',
    artist: 'Smooth Trio',
    album: 'Evening Sessions',
    genre: 'Jazz',
    imageUrl: { uri: 'https://picsum.photos/seed/jazz/400/400' },
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 30,
  },
  {
    id: '5',
    title: 'Digital Horizon',
    artist: 'Future Bass',
    album: 'Electronic Landscapes',
    genre: 'Future Bass',
    imageUrl: { uri: 'https://picsum.photos/seed/digital/400/400' },
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 30,
  },
];

// Animated Logo Component (no heart emoji)
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
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
      }}
    >
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
              {/* Skip Button */}
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

              {/* Already Like Button */}
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

              {/* Hidden Gem Button */}
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

              {/* Swipe Tip */}
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

// Intense Animated Background Component
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
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: backgroundColor1 }
        ]} 
      />
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: backgroundColor2 }
        ]} 
      />
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: backgroundColor3 }
        ]} 
      />
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
}: {
  song: SongWithGenre;
  index: number;
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
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

      const isSwipingVertical =
        Math.abs(velocityY) > Math.abs(velocityX) &&
        Math.abs(velocityY) > 500;
      const isSwipingHorizontal =
        Math.abs(velocityX) > Math.abs(velocityY) &&
        Math.abs(velocityX) > 500;

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
      ? interpolate(
          Math.abs(translateX.value),
          [0, SCREEN_WIDTH / 2],
          [1, 0.5],
          Extrapolate.CLAMP
        )
      : isNext
      ? 0.5
      : 0.25;

    const scale = isActive ? 1 : isNext ? 0.94 : 0.88;
    const translateYOffset = isActive ? 0 : isNext ? 15 : 30;

    return {
      transform: [
        { translateX: isActive ? translateX.value : 0 },
        { translateY: isActive ? translateY.value : translateYOffset },
        { rotate: `${isActive ? rotate : 0}deg` },
        { scale },
      ],
      opacity,
      zIndex: isActive ? 10 : isNext ? 5 : 0,
    };
  });

  const skipOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-150, -50, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    ),
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 50, 150],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    ),
  }));

  const addOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-150, -50, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    ),
  }));

  if (!isActive && !isNext && !isNextNext) return null;

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
            <Image source={song.imageUrl} style={styles.albumImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
              style={styles.gradient}
            />

            <View style={styles.genreBadge}>
              <BlurView intensity={80} tint="dark" style={styles.blurView}>
                <Text style={styles.genreText}>{song.genre}</Text>
              </BlurView>
            </View>

            {isActive && (
              <>
                <Pressable
                  onPress={onTogglePlay}
                  style={styles.playButton}
                >
                  <BlurView intensity={40} tint="dark" style={styles.playButtonBlur}>
                    {isPlaying ? (
                      <Pause color="white" size={32} />
                    ) : (
                      <Play color="white" size={32} style={{ marginLeft: 4 }} />
                    )}
                  </BlurView>
                </Pressable>

                <View style={styles.volumeIndicator}>
                  <BlurView intensity={60} tint="dark" style={styles.volumeBlur}>
                    <Volume2 color="white" size={16} />
                  </BlurView>
                </View>
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
              {song.album}
            </Text>
          </View>
        </View>
      </AnimatedReanimated.View>
    </PanGestureHandler>
  );
};

export default function MusicSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hiddenGems, setHiddenGems] = useState<SongWithGenre[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);

  const currentSong = mockSongsWithGenre[currentIndex];

  // Initialize Firebase and load user data on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeUser();
        const gems = await getHiddenGems();
        // Convert Firebase data back to our format
        const formattedGems = gems.map((gem: any) => ({
          ...gem,
          imageUrl: { uri: gem.imageUrl }
        }));
        setHiddenGems(formattedGems);
      } catch (error) {
        console.error('Error loading data:', error);
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

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    try {
      if (direction === 'right') {
        // Save to Hidden Gems in Firebase
        const songToSave: Song = {
          id: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album,
          genre: currentSong.genre,
          imageUrl: currentSong.imageUrl.uri,
          previewUrl: currentSong.previewUrl,
        };
        await saveHiddenGem(songToSave);
        setHiddenGems([...hiddenGems, currentSong]);
      } else if (direction === 'left') {
        // Save to skipped in Firebase
        await saveSkipped(currentSong.id);
      } else if (direction === 'up') {
        // Save to already liked in Firebase
        await saveAlreadyLiked(currentSong.id);
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }

    setTimeout(() => {
      if (currentIndex < mockSongsWithGenre.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleButtonSwipe = async (direction: 'left' | 'right' | 'up') => {
    try {
      if (direction === 'right') {
        // Save to Hidden Gems in Firebase
        const songToSave: Song = {
          id: currentSong.id,
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album,
          genre: currentSong.genre,
          imageUrl: currentSong.imageUrl.uri,
          previewUrl: currentSong.previewUrl,
        };
        await saveHiddenGem(songToSave);
        setHiddenGems([...hiddenGems, currentSong]);
      } else if (direction === 'left') {
        // Save to skipped in Firebase
        await saveSkipped(currentSong.id);
      } else if (direction === 'up') {
        // Save to already liked in Firebase
        await saveAlreadyLiked(currentSong.id);
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }

    if (currentIndex < mockSongsWithGenre.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AnimatedBackground />

      <View style={styles.header}>
        <AnimatedLogo />
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setShowHelp(true)}
            style={styles.helpButton}
          >
            <HelpCircle color="#000" size={20} />
          </Pressable>
          <Pressable
            onPress={() => setShowPlaylist(true)}
            style={styles.playlistButton}
          >
            <Heart color="#000" size={16} />
            <Text style={styles.playlistText}>
              Hidden Gems ({hiddenGems.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {mockSongsWithGenre.map((song, index) => (
          <SwipeCard
            key={song.id}
            song={song}
            index={index}
            currentIndex={currentIndex}
            onSwipe={handleSwipe}
            isPlaying={isPlaying && index === currentIndex}
            onTogglePlay={togglePlay}
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

      <Modal
        visible={showPlaylist}
        animationType="slide"
        transparent={false}
      >
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
                <View key={`${song.id}-${index}`} style={styles.playlistItem}>
                  <Image source={song.imageUrl} style={styles.playlistImage} />
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistSongTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.playlistArtist} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </View>
                </View>
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