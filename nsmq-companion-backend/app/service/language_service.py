from app.service.base_service import BaseService
from TTS.tts.configs.vits_config import VitsConfig
from TTS.tts.models.vits import Vits
import numpy as np
from sentence_transformers import SentenceTransformer

class LanguageService(BaseService):
    def __init__(self):
        self.tts_model = self.load_tts_model()
        self.sentence_transformer_model = self.load_sentence_transformer_model()


    def load_tts_model(self):
        model_config = VitsConfig()
        model_config.load_json('app/utils/tts_files/quizmistressConfig.json')
        tts_model = Vits.init_from_config(model_config)
        tts_model.load_onnx('app/utils/tts_files/quizmistress.onnx')
        return tts_model

    def load_sentence_transformer_model(self):
        return SentenceTransformer("all-MiniLM-L6-v2")

    async def synthesize_text(self, text):
        text_inputs = np.asarray(
            self.tts_model.tokenizer.text_to_ids(text, language="en"),
            dtype=np.int64,
        )[None, :]
        audio = self.tts_model.inference_onnx(text_inputs, speaker_id=0)[0]
        return audio

    async def calculate_similarity(self, question_answer, student_answer):
        if not self.sentence_transformer_model:
            raise ValueError("Sentence transformer model not loaded")

        embeddings1 = self.sentence_transformer_model.encode([question_answer])
        embeddings2 = self.sentence_transformer_model.encode([student_answer])
        similarities = self.sentence_transformer_model.similarity(embeddings1, embeddings2)
        similarity_score = similarities[0][0]
        return similarity_score