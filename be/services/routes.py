from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, File
from fastapi import UploadFile
import asyncio
from shazamio import Shazam, exceptions
import requests
from dotenv import load_dotenv
import os
import logging
from utils.fingerprint import generate_fingerprint, is_cached, get_cached, cache_song

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
router = APIRouter()
shazam = Shazam()
search_url = "https://www.googleapis.com/youtube/v3/search"
audd_url = "https://api.audd.io/"

def get_final_url(initial_url):
    response = requests.get(initial_url, allow_redirects=True)
    final_url = response.url
    return final_url

@router.post("/find-music")
async def find_music(files: List[UploadFile] = File(...)):
    print(f"Received {len(files)} files")
    ids = []
    semaphore = asyncio.Semaphore(8)  # allow 8 concurrent requests
    
    async def process_file(file: UploadFile, retries=3, base_delay=5):
        async with semaphore:  # wait if there are already 8 tasks running
            try:
                name = None
                title = None
                artist = None
                content = await file.read()
                print(f"Processing {file.filename}...")
                
                # check if the fingerprint is cached
                fingerprint = generate_fingerprint(content)
                if is_cached(fingerprint):
                    print(f"Found {file.filename} in cache")
                    cached = get_cached(fingerprint)
                    name = f"{cached['title']} - {cached['artist']}"
                    videoId = cached['videoId']
                    ids.append(videoId)
                    return name

                else:
                    # try recognition with retries and exponential backoff
                    for attempt in range(retries):
                        try:
                            result = await shazam.recognize(data=content)
                            
                            if track := result.get("track", None):
                                name = f"{track.get('title', 'Unknown')} - {track.get('subtitle', 'Unknown Artist')}"
                                title = track.get('title', 'Unknown')
                                artist = track.get('subtitle', 'Unknown Artist')
                                print(f"Cached {file.filename} as {name}")
                                break
                            else:
                                # perform audd search if needed
                                data = {
                                    'api_token': os.getenv("AUDD_API_KEY"),
                                    'return': 'apple_music,spotify',
                                }
                                files = {'file': content}
                                response = requests.post(audd_url, data=data, files=files)
                                response = response.json()
                                if response['status'] == 'success' and response['result'] is not None:
                                    name = f"{response['result']['title']} - {response['result']['artist']}"
                                    title = response['result']['title']
                                    artist = response['result']['artist']
                                    print(f"Cached {file.filename} as {name}")
                                    break

                                
                        except exceptions.FailedDecodeJsonException:
                            logging.error(f"Failed to process {file.filename} on attempt {attempt + 1}")
                            if attempt < retries - 1:
                                delay = base_delay * (attempt + 1)  # exponential backoff
                                logging.info(f"Retrying in {delay} seconds...")
                                await asyncio.sleep(delay)
                            else:
                                return "Recognition service error"
                        except Exception as e:
                            logging.error(f"Error processing {file.filename} on attempt {attempt + 1}: {str(e)}")
                            if attempt < retries - 1:
                                delay = base_delay * (attempt + 1)
                                logging.info(f"Retrying in {delay} seconds...")
                                await asyncio.sleep(delay)
                            else:
                                return "Processing error"
                
                if name is None:
                    return "No match found"

                params = {
                    "part": "snippet",
                    "q": name + "official",
                    "order": "relevance",
                    "maxResults": 1,
                    "key": YOUTUBE_API_KEY
                }

                response = requests.get(search_url, params=params)
                videoId = response.json().get("items", [{}])[0].get("id", {}).get("videoId", None)
                link = f"https://www.youtube.com/watch?v={videoId}" if videoId is not None else None
                cache_song(fingerprint, title, artist, videoId)
                print([name, link])
                ids.append(videoId)
                
                return name
                
            finally:
                await file.close()
                await asyncio.sleep(2)
    
    tasks = [process_file(file) for file in files]

    results = await asyncio.gather(*tasks)

    playlist = "https://www.youtube.com/watch_videos?video_ids=" + ",".join(ids)
    final_playlist = get_final_url(playlist)
    return {"results": results, "playlist": final_playlist}