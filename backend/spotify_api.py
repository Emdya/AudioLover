import os
print("RUNNING FILE:", os.path.abspath(__file__))

import requests
import base64

CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"


# APP-ONLY TOKEN (client credentials)
def get_app_access_token():
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth_string.encode()).decode()

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post(url, headers=headers, data=data)
    return response.json()["access_token"]


# TRACK METADATA (does NOT require user token)
def get_track_metadata(track_id):
    token = get_app_access_token()
    url = f"https://api.spotify.com/v1/tracks/{track_id}"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    return response.json()


def extract_features(track_json):
    return {
        "id": track_json["id"],
        "name": track_json["name"],
        "artist": track_json["artists"][0]["name"],
        "album": track_json["album"]["name"],
        "release_date": track_json["album"]["release_date"],
        "popularity": track_json["popularity"],
        "explicit": track_json["explicit"]
    }



# USER TOKEN FUNCTIONS (these need user login)

# Top Artists
def get_user_top_artists(user_token, limit=10):
    url = f"https://api.spotify.com/v1/me/top/artists?limit={limit}"
    headers = {"Authorization": f"Bearer {user_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


# Top Tracks
def get_user_top_tracks(user_token, limit=10):
    url = f"https://api.spotify.com/v1/me/top/tracks?limit={limit}"
    headers = {"Authorization": f"Bearer {user_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


# Recently played
def get_recent_tracks(user_token, limit=10):
    url = f"https://api.spotify.com/v1/me/player/recently-played?limit={limit}"
    headers = {"Authorization": f"Bearer {user_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


# Audio features ( using user token)
def get_audio_features(track_id, user_token):
    url = f"https://api.spotify.com/v1/audio-features/{track_id}"
    headers = {"Authorization": f"Bearer {user_token}"}

    response = requests.get(url, headers=headers)
    return response.json()


