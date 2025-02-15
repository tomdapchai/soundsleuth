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
async def find_music(files : List[UploadFile] = File(...)):
    print(f"Received {len(files)} files")
    result = []
    async def process_file(file: UploadFile):
        try:
            name = None
            link = None
            content = await file.read()
            result = await shazam.recognize(data=content)

            if track := result.get("track", None):
               name =  f"{track.get('title', 'Unknown')} - {track.get('subtitle', 'Unknown Artist')}"
               
            else:
                # perform audd search
                pass
            # perform youtube search here
            params = {
                "part": "snippet",
                "q": name,
                "order": "viewCount",
                "key": YOUTUBE_API_KEY
            }
            response = requests.get(search_url, params=params)
            videoId = response.json().get("items", [{}])[0].get("id", {}).get("videoId", None)
            link = f"https://www.youtube.com/watch?v={videoId}" if videoId is not None else None
            # print(f"Found {name} at {link}")
            print([name, link])
            return "No match found" if name is None else name
            
        except exceptions.FailedDecodeJsonException:
            logging.error(f"Failed to process {file.filename}")
            return "Recognition service error"
        except Exception as e:
            logging.error(f"Error processing {file.filename}: {str(e)}")
            return "Processing error"
        finally:
            await file.close() 

    results = await asyncio.gather(*[process_file(file) for file in files])
    return {"results": results}