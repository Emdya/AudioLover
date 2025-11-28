# logic.py
import random
from spotify_api import (
    get_track_metadata,
    get_audio_features
)

#  USER PROFILE (stores preferences)
class UserProfile:
    def __init__(self):
        self.liked_songs = []
        self.disliked_songs = []

        self.artist_freq = {}     # {artist_id: {"likes": n, "dislikes": n}}
        self.genre_freq = {}      # {genre: {"likes": n, "dislikes": n}}

        self.audio_liked = []     # list of dicts: each is audio feature set
        self.audio_disliked = []

    # Update profile from swipes
    def update_profile(self, song, liked: bool):
        artist = song["artist_id"]
        genres = song.get("genres", [])
        audio = song.get("audio_features", {})

        if liked:
            self.liked_songs.append(song["id"])
        else:
            self.disliked_songs.append(song["id"])

        # update artist frequencies
        if artist not in self.artist_freq:
            self.artist_freq[artist] = {"likes": 0, "dislikes": 0}

        if liked:
            self.artist_freq[artist]["likes"] += 1
        else:
            self.artist_freq[artist]["dislikes"] += 1

        # update genre frequencies
        for g in genres:
            if g not in self.genre_freq:
                self.genre_freq[g] = {"likes": 0, "dislikes": 0}

            if liked:
                self.genre_freq[g]["likes"] += 1
            else:
                self.genre_freq[g]["dislikes"] += 1

        # update audio features
        if liked:
            self.audio_liked.append(audio)
        else:
            self.audio_disliked.append(audio)

    # Average audio features
    def get_average_audio(self, liked=True):
        lst = self.audio_liked if liked else self.audio_disliked
        if len(lst) == 0:
            return None

        avg = {}
        keys = lst[0].keys()
        for k in keys:
            avg[k] = sum(song[k] for song in lst) / len(lst)
        return avg


#  SCORING SYSTEM
class RecommendationScorer:
    WEIGHT_ARTIST = 0.4
    WEIGHT_GENRE = 0.2
    WEIGHT_AUDIO = 0.3
    WEIGHT_POP = 0.1

    # score artist
    def artist_score(self, profile: UserProfile, artist_id):
        if artist_id not in profile.artist_freq:
            return 0.5  # neutral

        likes = profile.artist_freq[artist_id]["likes"]
        dislikes = profile.artist_freq[artist_id]["dislikes"]

        if likes + dislikes == 0:
            return 0.5

        return likes / (likes + dislikes)

    # score genres
    def genre_score(self, profile: UserProfile, genres):
        if not genres:
            return 0.5

        scores = []
        for g in genres:
            if g not in profile.genre_freq:
                scores.append(0.5)
            else:
                likes = profile.genre_freq[g]["likes"]
                dislikes = profile.genre_freq[g]["dislikes"]
                if likes + dislikes == 0:
                    scores.append(0.5)
                else:
                    scores.append(likes / (likes + dislikes))

        return sum(scores) / len(scores) if scores else 0.5

    # audio feature similarity
    def audio_similarity(self, profile: UserProfile, candidate_audio):
        avg = profile.get_average_audio(liked=True)
        if avg is None:
            return 0.5

        diffs = []
        for k in avg:
            diffs.append(1 - abs(avg[k] - candidate_audio.get(k, 0)))

        return sum(diffs) / len(diffs)

    # popularity score
    def popularity_score(self, pop):
        return pop / 100

    # final score
    def combined_score(self, profile, song):
        a = self.artist_score(profile, song["artist_id"])
        g = self.genre_score(profile, song["genres"])
        f = self.audio_similarity(profile, song["audio_features"])
        p = self.popularity_score(song["popularity"])

        return (
            self.WEIGHT_ARTIST * a +
            self.WEIGHT_GENRE * g +
            self.WEIGHT_AUDIO * f +
            self.WEIGHT_POP * p
        )

#  HIGH LEVEL FUNCTIONS USED IN app.py
# pretend calibration pool (example)
CALIBRATION_TRACKS = [
    "0VjIjW4GlUZAMYd2vXMi3b",
    "4iV5W9uYEdYUVa79Axb7Rh",
    "1i1fxkWeaMmKEB4T7zqbzK",
    "7lPN2DXiMsVn7XUKtOW1CS",
    "6habFhsOp2NvshLv26DqMb"
]

def get_song_data(track_id, user_token):
    """Fetch metadata + audio features combined into one dictionary."""

    meta = get_track_metadata(track_id)
    audio = get_audio_features(track_id, user_token)

    return {
        "id": track_id,
        "name": meta.get("name"),
        "artist_id": meta["artists"][0]["id"],
        "artist_name": meta["artists"][0]["name"],
        "album": meta["album"]["name"],
        "release_date": meta["album"]["release_date"],
        "genres": meta["artists"][0].get("genres", []),
        "popularity": meta.get("popularity", 50),
        "audio_features": audio if audio else {}
    }


def get_recommendations_for_new_user(user_token):
    """Return calibration pool of songs."""
    return [
        get_song_data(tid, user_token)
        for tid in CALIBRATION_TRACKS
    ]


def recommend_next_song(profile: UserProfile, user_token):
    """Return next best song based on scoring."""
    scorer = RecommendationScorer()

    # for now, random popular songs
    candidate_ids = CALIBRATION_TRACKS
    scored = []

    for tid in candidate_ids:
        song = get_song_data(tid, user_token)
        score = scorer.combined_score(profile, song)
        scored.append((score, song))

    scored.sort(reverse=True, key=lambda x: x[0])
    return scored[0][1]  # highest score
