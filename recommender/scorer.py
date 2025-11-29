import math
from typing import Dict, List
from .models import UserProfile

class RecommendationScorer:
    """Calculates recommendation scores for candidate songs"""
    
    # Weight distribution (must sum to 1.0)
    WEIGHT_ARTIST = 0.4
    WEIGHT_GENRE = 0.2
    WEIGHT_AUDIO = 0.3
    WEIGHT_POPULARITY = 0.1
    
    # Recommendation threshold
    RECOMMENDATION_THRESHOLD = 0.6  # Only recommend songs scoring 0.6 or higher
    
    def __init__(self, user_profile: UserProfile):
        self.profile = user_profile
    
    def calculate_artist_score(self, artist_id: str) -> float:
        """
        Calculate artist familiarity score (0-1)
        Returns 0.5 for unknown artists (neutral)
        """
        if artist_id not in self.profile.artist_frequencies:
            return 0.5  # Neutral for unknown artists
        
        freq = self.profile.artist_frequencies[artist_id]
        total = freq['likes'] + freq['dislikes']
        
        if total == 0:
            return 0.5
        
        # Simple ratio: likes / total
        return freq['likes'] / total
    
    def calculate_genre_score(self, genres: List[str]) -> float:
        """
        Calculate genre match score (0-1)
        Takes the average score across all genres in the song
        """
        if not genres:
            return 0.5
        
        genre_scores = []
        
        for genre in genres:
            if genre not in self.profile.genre_frequencies:
                genre_scores.append(0.5)  # Neutral for unknown genres
            else:
                freq = self.profile.genre_frequencies[genre]
                total = freq['likes'] + freq['dislikes']
                
                if total == 0:
                    genre_scores.append(0.5)
                else:
                    genre_scores.append(freq['likes'] / total)
        
        # Return average score across all genres
        return sum(genre_scores) / len(genre_scores)
    
    def calculate_audio_similarity_score(self, candidate_features: Dict) -> float:
        """
        Calculate audio feature similarity (0-1)
        Uses Euclidean distance, normalized to 0-1 scale
        Lower distance = higher similarity = higher score
        """
        avg_liked = self.profile.get_average_audio_features(liked=True)
        
        if not avg_liked:
            return 0.5  # Neutral if no liked songs yet
        
        # Calculate Euclidean distance
        distance = 0
        feature_count = 0
        
        for feature_key in candidate_features.keys():
            if feature_key in avg_liked:
                # Normalize features to similar scales
                candidate_val = self._normalize_feature(feature_key, candidate_features[feature_key])
                avg_val = self._normalize_feature(feature_key, avg_liked[feature_key])
                
                distance += (candidate_val - avg_val) ** 2
                feature_count += 1
        
        if feature_count == 0:
            return 0.5
        
        # Calculate normalized distance (sqrt of mean squared differences)
        distance = math.sqrt(distance / feature_count)
        
        # Convert distance to similarity score (0 distance = 1.0 score, max distance = 0.0 score)
        # Assuming max distance is sqrt(2) for normalized features
        max_distance = math.sqrt(2)
        similarity = 1 - (distance / max_distance)
        
        return max(0, min(1, similarity))  # Clamp to [0, 1]
    
    def _normalize_feature(self, feature_key: str, value: float) -> float:
        """Normalize audio features to 0-1 scale"""
        # Most features are already 0-1, but tempo and loudness need normalization
        if feature_key == 'tempo':
            # Typical tempo range: 50-200 BPM
            return (value - 50) / 150
        elif feature_key == 'loudness':
            # Typical loudness range: -60 to 0 dB
            return (value + 60) / 60
        else:
            # Already normalized (danceability, energy, valence, acousticness, etc.)
            return value
    
    def calculate_popularity_score(self, popularity: int) -> float:
        """
        Calculate popularity score (0-1)
        Spotify popularity is 0-100
        """
        return popularity / 100
    
    def calculate_total_score(self, candidate_song: Dict) -> Dict:
        """
        Calculate total weighted score for a candidate song
        Returns dict with breakdown of scores
        """
        # Calculate individual scores
        artist_score = self.calculate_artist_score(candidate_song['artist_id'])
        genre_score = self.calculate_genre_score(candidate_song['genres'])
        audio_score = self.calculate_audio_similarity_score(candidate_song['audio_features'])
        popularity_score = self.calculate_popularity_score(candidate_song['popularity'])
        
        # Calculate weighted total
        total_score = (
            artist_score * self.WEIGHT_ARTIST +
            genre_score * self.WEIGHT_GENRE +
            audio_score * self.WEIGHT_AUDIO +
            popularity_score * self.WEIGHT_POPULARITY
        )
        
        return {
            'total_score': total_score,
            'breakdown': {
                'artist_score': artist_score,
                'genre_score': genre_score,
                'audio_score': audio_score,
                'popularity_score': popularity_score
            },
            'weighted_contributions': {
                'artist': artist_score * self.WEIGHT_ARTIST,
                'genre': genre_score * self.WEIGHT_GENRE,
                'audio': audio_score * self.WEIGHT_AUDIO,
                'popularity': popularity_score * self.WEIGHT_POPULARITY
            }
        }
    
    def should_recommend(self, candidate_song: Dict) -> bool:
        """
        Determines if a song should be recommended based on threshold
        Returns True if score >= 0.6, False otherwise
        """
        score_result = self.calculate_total_score(candidate_song)
        return score_result['total_score'] >= self.RECOMMENDATION_THRESHOLD
    
    def score_and_filter_songs(self, candidate_songs: List[Dict]) -> List[Dict]:
        """
        Scores a list of candidate songs and returns only those above threshold
        Returns list of songs with their scores, sorted by score (highest first)
        """
        scored_songs = []
        
        for song in candidate_songs:
            score_result = self.calculate_total_score(song)
            
            # Only include if above threshold
            if score_result['total_score'] >= self.RECOMMENDATION_THRESHOLD:
                scored_songs.append({
                    'song': song,
                    'score': score_result['total_score'],
                    'score_breakdown': score_result['breakdown']
                })
        
        # Sort by score (highest first)
        scored_songs.sort(key=lambda x: x['score'], reverse=True)
        
        return scored_songs
