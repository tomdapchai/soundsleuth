from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, File
from fastapi import UploadFile
from pydantic import BaseModel
import asyncio
from shazamio import Shazam, exceptions
import requests
from dotenv import load_dotenv
import os
import logging
import json

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
router = APIRouter()
shazam = Shazam()
search_url = "https://www.googleapis.com/youtube/v3/search"


@router.post("/find-music")
async def find_music(files: List[UploadFile] = File(...)):
    print(f"Received {len(files)} files")
    
    # Semaphore to limit concurrent requests
    semaphore = asyncio.Semaphore(8)  # Allow only 2 concurrent requests
    
    async def process_file(file: UploadFile, retries=3, base_delay=5):
        async with semaphore:  # This will wait if there are already 2 tasks running
            try:
                name = None
                content = await file.read()
                print(f"Processing {file.filename}...")
                
                # Try recognition with retries and exponential backoff
                for attempt in range(retries):
                    try:
                        result = await shazam.recognize(data=content)
                        
                        if track := result.get("track", None):
                            name = f"{track.get('title', 'Unknown')} - {track.get('subtitle', 'Unknown Artist')}"
                            break
                        else:
                            # perform audd search if needed
                            pass
                            
                    except exceptions.FailedDecodeJsonException:
                        logging.error(f"Failed to process {file.filename} on attempt {attempt + 1}")
                        if attempt < retries - 1:
                            delay = base_delay * (attempt + 1)  # Exponential backoff
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
                
                # If YouTube search is needed, add it here
                # ...
                
                if name is None:
                    return "No match found"
                params = {
                    "part": "snippet",
                    "q": name,
                    "order": "viewCount",
                    "maxResults": 1,
                    "key": YOUTUBE_API_KEY
                }

                response = requests.get(search_url, params=params)
                videoId = response.json().get("items", [{}])[0].get("id", {}).get("videoId", None)
                link = f"https://www.youtube.com/watch?v={videoId}" if videoId is not None else None
                # print(f"Found {name} at {link}")
                print([name, link])
                return name
                
            finally:
                await file.close()
                # Add a small delay after completing each file to further reduce load
                await asyncio.sleep(2)
    
    # Process files with some delay between starting each task
    # Create all tasks at once
    tasks = [process_file(file) for file in files]

    # Let the semaphore handle concurrency control
    results = await asyncio.gather(*tasks)
    return {"results": results}