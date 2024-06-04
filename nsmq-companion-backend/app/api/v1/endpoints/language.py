from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from app.schemas.text import TextModel
from app.schemas.similarity_res import SimilarityRequest, SimilarityResponse
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.models.vits import Vits
from TTS.utils.audio.numpy_transforms import save_wav
import io
import numpy as np
from sentence_transformers import SentenceTransformer
from dependency_injector.wiring import Provide, inject
from app.core.container import Container
from app.service.language_service import LanguageService
import whisper
import torch
import os
from fastapi.responses import StreamingResponse

router = APIRouter(
    prefix="/language_services",
    tags=["Language Services"],
)

model_config = VitsConfig()
model_config.load_json('app/utils/tts_files/quizmistressConfig.json')
tts_model = Vits.init_from_config(model_config)
tts_model.load_onnx('app/utils/tts_files/quizmistress.onnx')

# whisper.load_model("medium.en")
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# device = torch.device("mps")
# model = whisper.load_model("medium.en", device=DEVICE)

# def transcribe(path_to_audio):
#     """Loads whisper model to transcribe audio"""

#     audio = whisper.load_audio(path_to_audio)

#     result = model.transcribe(audio)

#     return result["text"]

# @router.post("/get-transcript")

# async def get_transcript(audio: UploadFile = File(...)):
#     try:
#         audio_bytes = await audio.read()
#         audio_filename = audio.filename
#         with open(audio_filename, 'wb') as file:
#             file.write(audio_bytes)
#         transcript = transcribe(audio_filename)
#         os.remove(audio_filename)
#         return {"transcript": transcript}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.post("/synthesize/")
@inject
async def create_audio(text_model: TextModel, service: LanguageService = Depends(Provide[Container.language_service])):
    text = text_model.text
    try:
        audio = await service.synthesize_text(text)
        byte_io = io.BytesIO()
        save_wav(wav=audio, path=byte_io, sample_rate=22050)
        byte_io.seek(0)
        return StreamingResponse(byte_io, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.on_event("startup")
# def load_model():
#     global st_model
#     st_model = SentenceTransformer("all-MiniLM-L6-v2")

@router.post("/calculate-similarity", response_model=None)
@inject
async def calculate_similarity(
    request: SimilarityRequest,
    service: LanguageService = Depends(Provide[Container.language_service]),
):
    try:
        similarity_score = await service.calculate_similarity(request.question_answer, request.student_answer)
        return SimilarityResponse(similarity=similarity_score)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    