# from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
# from app.schemas.text import TextModel
# from app.schemas.similarity_res import SimilarityRequest, SimilarityResponse
# from TTS.tts.configs.vits_config import VitsConfig
# from TTS.tts.models.vits import Vits
# from TTS.utils.audio.numpy_transforms import save_wav
# import io
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from dependency_injector.wiring import Provide, inject
# from app.core.container import Container
# from app.service.language_service import LanguageService
# import whisper
# import torch
# import os
# from fastapi.responses import StreamingResponse

# router = APIRouter(
#     prefix="/language_services",
#     tags=["Language Services"],
# )

# model_config = VitsConfig()
# model_config.load_json('app/utils/tts_files/quizmistressConfig.json')
# tts_model = Vits.init_from_config(model_config)
# tts_model.load_onnx('app/utils/tts_files/quizmistress.onnx')

# # whisper.load_model("medium.en")
# # DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# # device = torch.device("mps")
# # model = whisper.load_model("medium.en", device=DEVICE)

# # def transcribe(path_to_audio):
# #     """Loads whisper model to transcribe audio"""

# #     audio = whisper.load_audio(path_to_audio)

# #     result = model.transcribe(audio)

# #     return result["text"]

# # @router.post("/get-transcript")

# # async def get_transcript(audio: UploadFile = File(...)):
# #     try:
# #         audio_bytes = await audio.read()
# #         audio_filename = audio.filename
# #         with open(audio_filename, 'wb') as file:
# #             file.write(audio_bytes)
# #         transcript = transcribe(audio_filename)
# #         os.remove(audio_filename)
# #         return {"transcript": transcript}
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/synthesize/")
# @inject
# async def create_audio(text_model: TextModel, service: LanguageService = Depends(Provide[Container.language_service])):
#     text = text_model.text
#     try:
#         audio = await service.synthesize_text(text)
#         byte_io = io.BytesIO()
#         save_wav(wav=audio, path=byte_io, sample_rate=22050)
#         byte_io.seek(0)
#         return StreamingResponse(byte_io, media_type="audio/wav")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # @router.on_event("startup")
# # def load_model():
# #     global st_model
# #     st_model = SentenceTransformer("all-MiniLM-L6-v2")


# @router.post("/calculate-similarity", response_model=None)
# @inject
# async def calculate_similarity(
#     request: SimilarityRequest,
#     service: LanguageService = Depends(Provide[Container.language_service]),
# ):
#     try:
#         similarity_score = await service.calculate_similarity(request.question_answer, request.student_answer)
#         return SimilarityResponse(similarity=similarity_score)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from fastapi import HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
import io
from app.schemas.similarity_res import SimilarityRequest, SimilarityResponse
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.models.vits import Vits
from TTS.utils.audio.numpy_transforms import save_wav
import os
import torch
import numpy as np
import whisper
import os
import torch
import torch.nn.functional as F
from app.schemas.text import TextModel
import numpy as np
from app.routers.shared import get_db
from sentence_transformers import SentenceTransformer


router = APIRouter(
    prefix="/language_services",
    tags=["Language Services"],
)

model_config = VitsConfig()
# model_config.load_json('app/utils/tts_files/quizmistressConfig.json')
# tts_model = Vits.init_from_config(model_config)
# tts_model.load_onnx('app/utils/tts_files/quizmistress.onnx')


# @router.post("/synthesize/")
# async def create_audio(text_model: TextModel):
#     text = text_model.text
#     try:
#         text_inputs = np.asarray(
#             tts_model.tokenizer.text_to_ids(text, language="en"),
#             dtype=np.int64,
#         )[None, :]
#         audio = tts_model.inference_onnx(text_inputs, speaker_id=0)[0]

#         # Convert numpy audio array to a bytes stream
#         byte_io = io.BytesIO()
#         save_wav(wav=audio, path=byte_io, sample_rate=22050)
#         byte_io.seek(0)  # Move to the beginning of the stream
#         return StreamingResponse(byte_io, media_type="audio/wav")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    


# whisper.load_model("medium.en")
# torch.cuda.is_available()
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# device = torch.device("mps")

model = whisper.load_model("medium.en", device = "cpu") 

def transcribe(path_to_audio):
  """Loads whisper model to transcribe audio"""

  audio = whisper.load_audio(path_to_audio)
  result = model.transcribe(audio)
  return result["text"]

@router.post("/get-transcript")
async def get_transcript(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        audio_filename = audio.filename
        with open(audio_filename, 'wb') as file:
            file.write(audio_bytes)
        transcript = transcribe(audio_filename)
        os.remove(audio_filename)
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.on_event("startup")
def load_model():
    global st_model
    st_model = SentenceTransformer("all-MiniLM-L6-v2")

@router.post("/calculate-similarity", response_model=None)
async def calculate_similarity(request: SimilarityRequest):
    try:
        embeddings1 = st_model.encode([request.question_answer])
        embeddings2 = st_model.encode([request.student_answer])

        similarities = st_model.similarity(embeddings1, embeddings2)

        similarity_score = similarities[0][0]

        return SimilarityResponse(similarity=similarity_score)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
