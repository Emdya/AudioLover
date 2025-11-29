from typing import Dict, List, Optional

class UserProfile:
    """Stores user preferences and updates with each swipe"""
    
    def __init__(self):
        self.liked_songs = []
        self.disliked_songs = []
        self.artist_frequencies = {}  # {artist_id: {'likes': int, 'dislikes': int}}
        self.genre_frequencies = {}   # {genre: {'likes': int, 'dislikes': int}}
        self.audio_features_liked = []  # List of audio feature dicts from liked songs
        self.audio_features_disliked = []  # List of audio feature dicts from disliked songs
    
    def update_profile(self, song: Dict, liked: bool):
        """Update profile based on user swipe"""
        # Update song lists
        if liked:
            self.liked_songs.append(song['track_id'])
            self.audio_features_liked.append(song['audio_features'])
        else:
            self.disliked_songs.append(song['track_id'])
            self.audio_features_disliked.append(song['audio_features'])
        
        # Update artist frequencies
        artist_id = song['artist_id']
        if artist_id not in self.artist_frequencies:
            self.artist_frequencies[artist_id] = {'likes': 0, 'dislikes': 0}
        
        if liked:
            self.artist_frequencies[artist_id]['likes'] += 1
        else:
            self.artist_frequencies[artist_id]['dislikes'] += 1
        
        # Update genre frequencies
        for genre in song['genres']:
            if genre not in self.genre_frequencies:
                self.genre_frequencies[genre] = {'likes': 0, 'dislikes': 0}
            
            if liked:
                self.genre_frequencies[genre]['likes'] += 1
            else:
                self.genre_frequencies[genre]['dislikes'] += 1
    
    def get_average_audio_features(self, liked=True) -> Optional[Dict]:
        """Calculate average audio features from liked or disliked songs"""
        features_list = self.audio_features_liked if liked else self.audio_features_disliked
        
        if not features_list:
            return None
        
        # Calculate averages for each feature
        avg_features = {}
        feature_keys = features_list[0].keys()
        
        for key in feature_keys:
            avg_features[key] = sum(f[key] for f in features_list) / len(features_list)
        
        return avg_features
    
    def get_profile_summary(self) -> Dict:
        """Get a summary of the user profile"""
        return {
            'total_likes': len(self.liked_songs),
            'total_dislikes': len(self.disliked_songs),
            'artists_tracked': len(self.artist_frequencies),
            'genres_tracked': len(self.genre_frequencies),
            'average_features_liked': self.get_average_audio_features(liked=True),
            'average_features_disliked': self.get_average_audio_features(liked=False)
        }
