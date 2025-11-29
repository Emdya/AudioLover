from recommender.models import UserProfile
from recommender.scorer import RecommendationScorer

# Example usage and testing
if __name__ == "__main__":
    # Initialize user profile
    profile = UserProfile()
    
    # Example calibration songs (user swipes on these)
    calibration_songs = [
        {
            'track_id': 'track_1',
            'name': 'Song A',
            'artist_id': 'artist_1',
            'artist_name': 'Artist One',
            'genres': ['pop', 'dance'],
            'audio_features': {
                'danceability': 0.8,
                'energy': 0.7,
                'valence': 0.6,
                'acousticness': 0.2,
                'tempo': 120,
                'loudness': -5
            },
            'popularity': 80
        },
        {
            'track_id': 'track_2',
            'name': 'Song B',
            'artist_id': 'artist_1',
            'artist_name': 'Artist One',
            'genres': ['pop'],
            'audio_features': {
                'danceability': 0.75,
                'energy': 0.65,
                'valence': 0.7,
                'acousticness': 0.15,
                'tempo': 115,
                'loudness': -6
            },
            'popularity': 75
        },
        {
            'track_id': 'track_3',
            'name': 'Song C',
            'artist_id': 'artist_2',
            'artist_name': 'Artist Two',
            'genres': ['rock', 'indie'],
            'audio_features': {
                'danceability': 0.5,
                'energy': 0.9,
                'valence': 0.4,
                'acousticness': 0.1,
                'tempo': 140,
                'loudness': -4
            },
            'popularity': 60
        }
    ]
    
    # Simulate user swiping (right = like, left = dislike)
    print("=== CALIBRATION PHASE ===\n")
    profile.update_profile(calibration_songs[0], liked=True)
    print(f"✓ User liked: {calibration_songs[0]['name']} by {calibration_songs[0]['artist_name']}")
    
    profile.update_profile(calibration_songs[1], liked=True)
    print(f"✓ User liked: {calibration_songs[1]['name']} by {calibration_songs[1]['artist_name']}")
    
    profile.update_profile(calibration_songs[2], liked=False)
    print(f"✗ User disliked: {calibration_songs[2]['name']} by {calibration_songs[2]['artist_name']}")
    
    # Show profile summary
    print("\n=== USER PROFILE SUMMARY ===\n")
    summary = profile.get_profile_summary()
    print(f"Total likes: {summary['total_likes']}")
    print(f"Total dislikes: {summary['total_dislikes']}")
    print(f"Artists tracked: {summary['artists_tracked']}")
    print(f"Genres tracked: {summary['genres_tracked']}")
    print(f"\nAverage audio features (liked songs):")
    for feature, value in summary['average_features_liked'].items():
        print(f"  {feature}: {value:.2f}")
    
    # Now test recommendation scoring
    print("\n=== RECOMMENDATION SCORING ===\n")
    scorer = RecommendationScorer(profile)
    
    # Multiple candidate songs to score
    candidates = [
        {
            'track_id': 'track_new_1',
            'name': 'New Song (Similar to likes)',
            'artist_id': 'artist_1',  # Known artist (liked)
            'artist_name': 'Artist One',
            'genres': ['pop', 'electronic'],
            'audio_features': {
                'danceability': 0.78,
                'energy': 0.68,
                'valence': 0.65,
                'acousticness': 0.18,
                'tempo': 118,
                'loudness': -5.5
            },
            'popularity': 70
        },
        {
            'track_id': 'track_new_2',
            'name': 'Another Song (Medium match)',
            'artist_id': 'artist_3',  # Unknown artist
            'artist_name': 'Artist Three',
            'genres': ['pop'],
            'audio_features': {
                'danceability': 0.65,
                'energy': 0.60,
                'valence': 0.50,
                'acousticness': 0.30,
                'tempo': 110,
                'loudness': -7
            },
            'popularity': 65
        },
        {
            'track_id': 'track_new_3',
            'name': 'Rock Song (Low match)',
            'artist_id': 'artist_2',  # Known artist (disliked)
            'artist_name': 'Artist Two',
            'genres': ['rock', 'alternative'],
            'audio_features': {
                'danceability': 0.45,
                'energy': 0.85,
                'valence': 0.35,
                'acousticness': 0.10,
                'tempo': 145,
                'loudness': -4
            },
            'popularity': 55
        }
    ]
    
    # Score and filter candidates (only those >= 0.6 threshold)
    print("Scoring multiple candidate songs...\n")
    recommendations = scorer.score_and_filter_songs(candidates)
    
    print(f"Songs passing threshold (>= {scorer.RECOMMENDATION_THRESHOLD}):\n")
    for i, rec in enumerate(recommendations, 1):
        song = rec['song']
        print(f"{i}. {song['name']} by {song['artist_name']}")
        print(f"   Score: {rec['score']:.3f}")
        print(f"   Breakdown: Artist={rec['score_breakdown']['artist_score']:.2f}, "
              f"Genre={rec['score_breakdown']['genre_score']:.2f}, "
              f"Audio={rec['score_breakdown']['audio_score']:.2f}, "
              f"Popularity={rec['score_breakdown']['popularity_score']:.2f}")
        print()
    
    # Check songs that didn't pass threshold
    print("Songs NOT recommended (below threshold):\n")
    for candidate in candidates:
        score_result = scorer.calculate_total_score(candidate)
        if score_result['total_score'] < scorer.RECOMMENDATION_THRESHOLD:
            print(f"✗ {candidate['name']} by {candidate['artist_name']}")
            print(f"  Score: {score_result['total_score']:.3f} (below {scorer.RECOMMENDATION_THRESHOLD})")
            print()
