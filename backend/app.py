from flask import Flask, redirect, request, jsonify
import urllib.parse
import requests
import time


# IMPORT LOGIC MODULE
from logic import (
    UserProfile,
    RecommendationScorer,
    get_recommendations_for_new_user,
    recommend_next_song,
    CALIBRATION_TRACKS
)

# IMPORT SPOTIFY API FUNCTIONS
from spotify_api import get_audio_features, get_track_metadata


# SPOTIFY APP CREDENTIALS
CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
REDIRECT_URI = "http://127.0.0.1:5001/callback"

SCOPES = (
    "user-read-email "
    "user-read-private "
    "user-top-read "
    "user-read-recently-played"
)

app = Flask(__name__)


# GLOBAL storage 
user_tokens = {}       # {"access_token": "...", "refresh_token": "...", "expires_at": ...}
user_profile = None    # stores UserProfile() for current user session


# TOKEN HELPERS
def exchange_code_for_token(code):
    """Exchange authorization code for access + refresh tokens."""
    token_url = "https://accounts.spotify.com/api/token"

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    response = requests.post(token_url, data=payload)
    return response.json()


def refresh_access_token(refresh_token):
    token_url = "https://accounts.spotify.com/api/token"

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    response = requests.post(token_url, data=payload)
    return response.json()


def get_valid_access_token():
    """Returns fresh access token (refreshes if expired)."""

    if "access_token" not in user_tokens:
        return None

    # check expiry
    if time.time() > user_tokens["expires_at"]:
        new_tokens = refresh_access_token(user_tokens["refresh_token"])
        user_tokens["access_token"] = new_tokens.get("access_token")
        user_tokens["expires_at"] = time.time() + new_tokens.get("expires_in", 3600)

    return user_tokens["access_token"]


# LOGIN ROUTE
@app.route("/login")
def login():
    auth_url = (
        "https://accounts.spotify.com/authorize?"
        f"client_id={CLIENT_ID}"
        "&response_type=code"
        f"&redirect_uri={urllib.parse.quote(REDIRECT_URI)}"
        f"&scope={urllib.parse.quote(SCOPES)}"
    )
    return redirect(auth_url)


# CALLBACK ROUTE
@app.route("/callback")
def callback():
    global user_profile

    code = request.args.get("code")
    tokens = exchange_code_for_token(code)

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 3600)

    # Save tokens
    user_tokens["access_token"] = access_token
    user_tokens["refresh_token"] = refresh_token
    user_tokens["expires_at"] = time.time() + expires_in

    # Reset profile when user logs in
    user_profile = UserProfile()

    return {
        "status": "success",
        "message": "Spotify user authenticated!",
    }

# RECOMMEND ENDPOINT
@app.route("/recommend")
def recommend():
    global user_profile

    token = get_valid_access_token()
    if not token:
        return {"error": "User not authenticated"}, 401

    # NEW USER: no likes/dislikes yet → return calibration songs
    if len(user_profile.liked_songs) == 0 and len(user_profile.disliked_songs) == 0:
        songs = get_recommendations_for_new_user(token)
        return jsonify({"mode": "calibration", "songs": songs})

    # RETURNING USER → calculate next best song
    song = recommend_next_song(user_profile, token)
    return jsonify({"mode": "algorithm", "song": song})


# SWIPE ENDPOINT
@app.route("/swipe", methods=["POST"])
def swipe():
    global user_profile

    token = get_valid_access_token()
    if not token:
        return {"error": "User not authenticated"}, 401

    data = request.get_json()

    track_id = data.get("track_id")
    liked = data.get("liked", False)

    # Fetch full song data (metadata + audio)
    meta = get_track_metadata(track_id)
    audio = get_audio_features(track_id, token)

    song_data = {
        "id": track_id,
        "artist_id": meta["artists"][0]["id"],
        "genres": meta["artists"][0].get("genres", []),
        "popularity": meta.get("popularity", 50),
        "audio_features": audio if audio else {},
    }

    # Update profile
    user_profile.update_profile(song_data, liked)

    # Next recommended song
    next_song = recommend_next_song(user_profile, token)

    return jsonify({
        "status": "ok",
        "updated": True,
        "next_song": next_song
    })


# RUN SERVER
if __name__ == "__main__":
    app.run(port=5001, debug=True)
