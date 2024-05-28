from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io

from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.models.vits import Vits
import numpy as np

from .shared import get_db
import re

router = APIRouter(
    prefix="/questions",
    tags=["Contest Questions"],
)

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

