from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io
from app.database.schemas import TextModel
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.models.vits import Vits
from TTS.utils.audio.numpy_transforms import save_wav

import numpy as np
from .shared import get_db
import re

router = APIRouter(
    prefix="/questions",
    tags=["Contest Questions"],
)

model_config = VitsConfig()
model_config.load_json('app/utils/tts_files/quizmistressConfig.json')
tts_model = Vits.init_from_config(model_config)
tts_model.load_onnx('app/utils/tts_files/quizmistress.onnx')

@router.get("/table", response_model=List[dict])
async def query_table_data(
    table_name: str = Query(..., description="Name of the table to query"),
    db: Session = Depends(get_db)
):
    if not re.match(r"^[a-zA-Z0-9_]+(?:\s[a-zA-Z0-9]+)?$", table_name):
        raise HTTPException(status_code=400, detail="Invalid table name provided.")
    
    safe_table_name = f'"{table_name}"'

    query = f"""
    SELECT "S/N", "Preamble Text", "Question", "Subject", "Answer"
    FROM {safe_table_name}
    """
    try:

        result = db.execute(text(query))
        result_list = result.mappings().all()
        return [{"S/N": row['S/N'], "Preamble Text": row['Preamble Text'], "Question": row['Question'], "Subject": row['Subject'],  "Answer": row['Answer']} for row in result_list]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/synthesize/")
async def create_audio(text_model: TextModel):
    text = text_model.text
    try:
        # Generate speech audio
        text_inputs = np.asarray(
            tts_model.tokenizer.text_to_ids(text, language="en"),
            dtype=np.int64,
        )[None, :]
        audio = tts_model.inference_onnx(text_inputs, speaker_id=0)[0]

        # Convert numpy audio array to a bytes stream
        byte_io = io.BytesIO()
        save_wav(wav=audio, path=byte_io, sample_rate=22050)
        byte_io.seek(0)  # Move to the beginning of the stream
        return StreamingResponse(byte_io, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



