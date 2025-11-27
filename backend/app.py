from flask import Flask, redirect, request, jsonify
import requests
import base64
import urllib.parse
import time

#  SPOTIFY APP CREDENTIALS
CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
REDIRECT_URI = "http://127.0.0.1:5001/callback"

SCOPES = "user-read-email user-read-private user-read-recently-played user-top-read"

app = Flask(__name__)

#  TOKEN STORAGE (simple in-memory version)
user_tokens = {}   # stores: access_token, refresh_token, expires_at

# Helper: Exchange code for access token
def exchange_code_for_token(code):
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


# Helper: Refresh access token when expired
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


# LOGIN ROUTE → Sends user to Spotify
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


# CALLBACK ROUTE → Spotify redirects user here
@app.route("/callback")
def callback():
    code = request.args.get("code")

    tokens = exchange_code_for_token(code)

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in")  # usually 3600 seconds

    # save tokens (only 1 user needed for hackathon)
    user_tokens["access_token"] = access_token
    user_tokens["refresh_token"] = refresh_token
    user_tokens["expires_at"] = time.time() + expires_in

    return {"status": "success", "message": "User authenticated!"}


# Helper: Ensure access token is still valid
def get_valid_access_token():
    # If first time
    if "access_token" not in user_tokens:
        return None

    # If token expired, refresh it
    if time.time() > user_tokens["expires_at"]:
        new_tokens = refresh_access_token(user_tokens["refresh_token"])
        user_tokens["access_token"] = new_tokens.get("access_token")
        user_tokens["expires_at"] = time.time() + new_tokens.get("expires_in", 3600)

    return user_tokens["access_token"]

# GET USER TOP TRACKS
@app.route("/user/top-tracks")
def top_tracks():
    token = get_valid_access_token()

    if not token:
        return {"error": "User not authenticated"}, 401

    url = "https://api.spotify.com/v1/me/top/tracks?limit=10"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)

    return response.json()


# TRACK METADATA ENDPOINT
@app.route("/track/<track_id>")
def track_metadata(track_id):
    from spotify_api import get_track_metadata, extract_features

    track = get_track_metadata(track_id)
    cleaned = extract_features(track)
    return jsonify(cleaned)


#  AUDIO FEATURES ENDPOINT
@app.route("/audio-features/<track_id>")
def audio_features(track_id):
    from spotify_api import get_audio_features
    token = get_valid_access_token()

    if not token:
        return {"error": "User not authenticated"}, 401

    audio = get_audio_features(track_id, token)  # updated signature
    return jsonify(audio)


#  RUN THE SERVER
if __name__ == "__main__":
    app.run(port=5001, debug=True)
