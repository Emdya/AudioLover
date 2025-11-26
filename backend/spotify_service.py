import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from dotenv import load_dotenv
import requests

load_dotenv()

# Initialize Spotify client
client_credentials_manager = SpotifyClientCredentials(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET')
)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# List of genres we support
AVAILABLE_GENRES = [
    'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient',
    'blues', 'classical', 'country', 'dance', 'disco',
    'drum-and-bass', 'dubstep', 'edm', 'electronic', 'folk',
    'funk', 'garage', 'gospel', 'grunge', 'happy',
    'hip-hop', 'house', 'indie', 'indie-pop', 'jazz',
    'k-pop', 'latin', 'metal', 'opera', 'party',
    'piano', 'pop', 'punk', 'r-n-b', 'reggae',
    'reggaeton', 'rock', 'romance', 'sad', 'salsa',
    'samba', 'singer-songwriter', 'ska', 'sleep', 'soul',
    'study', 'summer', 'synthwave', 'techno', 'trance',
    'trip-hop', 'work-out', 'world-music'
]

# Search terms for discovery - more likely to return results
DISCOVERY_SEARCHES = [
    'new music 2024',
    'top hits',
    'indie hits',
    'chill vibes',
    'workout music',
    'electronic dance',
    'hip hop beats',
    'rock classics',
    'pop hits',
    'r&b soul'
]


def get_deezer_preview(title, artist):
    """Search Deezer for a song and get its preview URL"""
    try:
        query = f"{title} {artist}".replace("'", "").replace('"', "")
        url = f"https://api.deezer.com/search?q={requests.utils.quote(query)}&limit=1"
        
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if data.get('data') and len(data['data']) > 0:
            return data['data'][0].get('preview')
        return None
    except Exception as e:
        print(f"Error getting Deezer preview: {e}")
        return None


def get_track_details(track):
    """Extract relevant details from a Spotify track object"""
    artist_id = track['artists'][0]['id']
    title = track['name']
    artist = track['artists'][0]['name']
    
    try:
        artist_info = sp.artist(artist_id)
        genres = artist_info.get('genres', [])
    except:
        genres = []
    
    # Get preview URL - try Spotify first, then Deezer as fallback
    preview_url = track['preview_url']
    if not preview_url:
        preview_url = get_deezer_preview(title, artist)
    
    return {
        'id': track['id'],
        'title': title,
        'artist': artist,
        'artistId': artist_id,
        'album': track['album']['name'],
        'albumImage': track['album']['images'][0]['url'] if track['album']['images'] else None,
        'previewUrl': preview_url,
        'popularity': track['popularity'],
        'releaseDate': track['album']['release_date'],
        'explicit': track['explicit'],
        'genres': genres,
        'durationMs': track['duration_ms'],
        'spotifyUrl': track['external_urls']['spotify']
    }


def search_tracks(query, limit=20, require_preview=False):
    """Search for tracks on Spotify"""
    try:
        # Request more tracks to filter for previews
        search_limit = limit * 3 if require_preview else limit
        results = sp.search(q=query, type='track', limit=search_limit, market='US')
        
        tracks = []
        for track in results['tracks']['items']:
            track_details = get_track_details(track)
            
            if require_preview:
                if track_details['previewUrl']:
                    tracks.append(track_details)
                    if len(tracks) >= limit:
                        break
            else:
                tracks.append(track_details)
        
        return tracks[:limit]
    except Exception as e:
        print(f"Error searching tracks: {e}")
        return []


def get_tracks_by_genre(genre, limit=20, require_preview=False):
    """Get tracks by searching for the genre term"""
    try:
        search_limit = limit * 3 if require_preview else limit
        results = sp.search(q=genre, type='track', limit=search_limit, market='US')
        
        tracks = []
        for track in results['tracks']['items']:
            track_details = get_track_details(track)
            
            if require_preview:
                if track_details['previewUrl']:
                    tracks.append(track_details)
                    if len(tracks) >= limit:
                        break
            else:
                tracks.append(track_details)
        
        return tracks[:limit]
    except Exception as e:
        print(f"Error getting tracks by genre: {e}")
        return []


def get_discovery_tracks(genres=None, limit=20, require_preview=False):
    """
    Get tracks for discovery using search queries
    """
    search_terms = genres if genres else ['indie', 'electronic', 'pop', 'rock', 'hip hop']
    
    all_tracks = []
    tracks_per_search = max(limit // len(search_terms), 5)
    
    for term in search_terms:
        tracks = search_tracks(term, limit=tracks_per_search * 2, require_preview=require_preview)
        all_tracks.extend(tracks)
    
    # Remove duplicates based on track ID
    seen_ids = set()
    unique_tracks = []
    for track in all_tracks:
        if track['id'] not in seen_ids:
            seen_ids.add(track['id'])
            unique_tracks.append(track)
    
    return unique_tracks[:limit]


def get_available_genres():
    """Get list of available genres"""
    return AVAILABLE_GENRES


def get_new_releases(limit=20):
    """Get new releases by searching for recent music"""
    try:
        # Search for new/recent music
        results = sp.search(q='new music 2024 2025', type='track', limit=limit, market='US')
        
        tracks = []
        for track in results['tracks']['items']:
            track_details = get_track_details(track)
            tracks.append(track_details)
        
        return tracks
    except Exception as e:
        print(f"Error getting new releases: {e}")
        return []


def get_featured_tracks(limit=20):
    """Get featured/popular tracks using search"""
    try:
        # Search for popular/top tracks
        results = sp.search(q='top hits 2024', type='track', limit=limit, market='US')
        
        tracks = []
        for track in results['tracks']['items']:
            track_details = get_track_details(track)
            tracks.append(track_details)
        
        return tracks
    except Exception as e:
        print(f"Error getting featured tracks: {e}")
        return []