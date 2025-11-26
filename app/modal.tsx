import { BlurView } from 'expo-blur';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Contributor = {
  name: string;
  bio: string;
  imageUrl: any;
};

const contributors: Contributor[] = [
  {
    name: 'Emdya Permuy-Llovio',
    bio: 'With the help of V0 by Vercel, Emdya created the frontend and design for this product as a part of the Code Spring 2025 Hackathon.',
    imageUrl: { uri: 'https://i.pravatar.cc/300?img=1' },
  },
  {
    name: 'Samuel Perez Tovar',
    bio: 'Helped research sound categories and prototyped early song-sorting logic.',
    imageUrl: { uri: 'https://i.pravatar.cc/300?img=2' },
  },
  {
    name: 'Okate',
    bio: 'Contributed UI refinements and early user-testing feedback for AudioLover.',
    imageUrl: { uri: 'https://i.pravatar.cc/300?img=3' },
  },
];

export default function ContributorsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % contributors.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? contributors.length - 1 : prev - 1
    );
  };

  const currentContributor = contributors[currentIndex];

  return (
    <>
      {/* Floating circular button */}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.floatingButton}
      >
        <BlurView intensity={80} tint="dark" style={styles.floatingButtonBlur}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' }}
            style={styles.userIcon}
          />
        </BlurView>
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <Animated.View
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(300)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* Close button */}
                <Pressable
                  onPress={() => setIsOpen(false)}
                  style={styles.closeButton}
                >
                  <X color="white" size={20} />
                </Pressable>

                {/* Image */}
                <Animated.View
                  key={`img-${currentIndex}`}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.imageContainer}
                >
                  <Image
                    source={currentContributor.imageUrl}
                    style={styles.contributorImage}
                  />
                </Animated.View>

                {/* Name */}
                <Animated.View
                  key={`name-${currentIndex}`}
                  entering={FadeIn.duration(200).delay(50)}
                  exiting={FadeOut.duration(200)}
                >
                  <Text style={styles.contributorName}>
                    {currentContributor.name}
                  </Text>
                </Animated.View>

                {/* Bio */}
                <Animated.View
                  key={`bio-${currentIndex}`}
                  entering={FadeIn.duration(200).delay(100)}
                  exiting={FadeOut.duration(200)}
                  style={styles.bioContainer}
                >
                  <Text style={styles.contributorBio}>
                    {currentContributor.bio}
                  </Text>
                </Animated.View>

                {/* Pagination arrows */}
                {contributors.length > 1 && (
                  <View style={styles.paginationContainer}>
                    <Pressable
                      onPress={handlePrev}
                      style={styles.arrowButton}
                    >
                      <ChevronLeft color="white" size={22} />
                    </Pressable>

                    <Text style={styles.paginationText}>
                      {currentIndex + 1} / {contributors.length}
                    </Text>

                    <Pressable
                      onPress={handleNext}
                      style={styles.arrowButton}
                    >
                      <ChevronRight color="white" size={22} />
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  floatingButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.4)',
  },
  userIcon: {
    width: 28,
    height: 28,
    tintColor: 'white',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  contributorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  contributorName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
  },
  bioContainer: {
    marginTop: 12,
  },
  contributorBio: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    gap: 30,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationText: {
    color: 'white',
    fontSize: 14,
  },
});