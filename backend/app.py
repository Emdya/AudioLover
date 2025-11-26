from flask import Flask, jsonify, request
from flask_cors import CORS
from spotify_service import (
    search_tracks,
    get_available_genres,
    get_new_releases,
    get_tracks_by_genre,
    get_discovery_tracks,
    get_featured_tracks
)

app = Flask(__name__)
CORS(app)  # Allow requests from React Native app


@app.route('/')
def home():
    return jsonify({
        'message': 'AudioLover API is running!',
        'endpoints': {
            '/api/discover': 'Get discovery tracks (main endpoint)',
            '/api/featured': 'Get featured tracks',
            '/api/genre/<genre>': 'Get tracks by genre',
            '/api/search': 'Search for songs',
            '/api/genres': 'Get available genres',
            '/api/new-releases': 'Get new releases'
        }
    })


@app.route('/api/discover', methods=['GET'])
def discover():
    """
    Get discovery tracks for the app
    Query params:
        - genres: comma-separated genre list (e.g., "indie,electronic,hip-hop")
        - limit: number of songs (default 20)
    """
    genres = request.args.get('genres', '')
    limit = request.args.get('limit', 20, type=int)
    
    genre_list = genres.split(',') if genres else None
    
    tracks = get_discovery_tracks(genres=genre_list, limit=limit)
    
    return jsonify({
        'success': True,
        'count': len(tracks),
        'tracks': tracks
    })


@app.route('/api/featured', methods=['GET'])
def featured():
    """
    Get featured tracks from Spotify's featured playlists
    Query params:
        - limit: number of songs (default 20)
    """
    limit = request.args.get('limit', 20, type=int)
    
    tracks = get_featured_tracks(limit=limit)
    
    return jsonify({
        'success': True,
        'count': len(tracks),
        'tracks': tracks
    })


@app.route('/api/genre/<genre>', methods=['GET'])
def genre_tracks(genre):
    """
    Get tracks by genre
    URL param:
        - genre: the genre to search for
    Query params:
        - limit: number of songs (default 20)
    """
    limit = request.args.get('limit', 20, type=int)
    
    tracks = get_tracks_by_genre(genre, limit=limit)
    
    return jsonify({
        'success': True,
        'genre': genre,
        'count': len(tracks),
        'tracks': tracks
    })


@app.route('/api/search', methods=['GET'])
def search():
    """
    Search for songs
    Query params:
        - q: search query (required)
        - limit: number of results (default 20)
    """
    query = request.args.get('q', '')
    limit = request.args.get('limit', 20, type=int)
    
    if not query:
        return jsonify({
            'success': False,
            'error': 'Search query is required'
        }), 400
    
    tracks = search_tracks(query, limit=limit)
    
    return jsonify({
        'success': True,
        'count': len(tracks),
        'tracks': tracks
    })


@app.route('/api/genres', methods=['GET'])
def genres():
    """Get list of available genres"""
    genre_list = get_available_genres()
    
    return jsonify({
        'success': True,
        'count': len(genre_list),
        'genres': genre_list
    })


@app.route('/api/new-releases', methods=['GET'])
def new_releases():
    """
    Get new releases
    Query params:
        - limit: number of songs (default 20)
    """
    limit = request.args.get('limit', 20, type=int)
    
    tracks = get_new_releases(limit=limit)
    
    return jsonify({
        'success': True,
        'count': len(tracks),
        'tracks': tracks
    })


if __name__ == '__main__':
    print("Starting AudioLover API server...")
    print("Available endpoints:")
    print("  - GET /api/discover?genres=indie,electronic&limit=20")
    print("  - GET /api/featured?limit=20")
    print("  - GET /api/genre/indie?limit=20")
    print("  - GET /api/search?q=artist+name&limit=20")
    print("  - GET /api/genres")
    print("  - GET /api/new-releases?limit=20")
    app.run(debug=True, port=5000, host="0.0.0.0")