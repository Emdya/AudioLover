import os
print("RUNNING FILE:", os.path.abspath(__file__))

import requests
import base64

CLIENT_ID = "99456ed3300249cdb0dd5eea8b9334a9"
CLIENT_SECRET = "172e57cfa7c4479690022ddb71582947"

def get_access_token():
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth_string.encode()).decode()

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post(url, headers=headers, data=data)
    print("RESPONSE JSON:", response.json())
    return response.json()["access_token"]

def get_track_metadata(track_id):
    token = get_access_token()
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

def get_audio_features(track_id):
    token = get_access_token()
    url = f"https://api.spotify.com/v1/audio-features/{track_id}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    return response.json()

if __name__ == "__main__":
    print("RUNNING FILE:", __file__)

    # Full metadata
    track = get_track_metadata("0VjIjW4GlUZAMYd2vXMi3b")
    print("FULL METADATA:", track)

    # Cleaned features
    cleaned = extract_features(track)
    print("CLEANED FEATURES:", cleaned)

    # Audio features
    audio = get_audio_features("0VjIjW4GlUZAMYd2vXMi3b")
    print("AUDIO FEATURES:", audio)

