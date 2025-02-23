import redis
import acoustid
import asyncio
import io
import tempfile
import os
from database.db_config import redis_db
import chromaprint

def generate_fingerprint(content: bytes):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        try:
            temp_file.write(content)
            temp_file.flush()
            duration, fp = acoustid.fingerprint_file(temp_file.name, maxlength=20, force_fpcalc=True)
            return fp
        finally:
            temp_file.close()
            os.unlink(temp_file.name)

def is_cached(fingerprint: str) -> bool:
    return redis_db.exists(fingerprint) > 0

def get_cached(fingerprint: str) -> dict:
    result = redis_db.hgetall(fingerprint)
    return {k.decode('utf-8'): v.decode('utf-8') for k, v in result.items()}

def cache_song(fingerprint: str, title: str, artist: str, videoId: str, expire_seconds: int = 3600):

    redis_db.hset(fingerprint, mapping={"title": title, "artist": artist, "videoId": videoId})
    redis_db.expire(fingerprint, expire_seconds)