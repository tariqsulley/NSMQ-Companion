from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI(
	title="NSMQ Companion Backend"
)

@app.get("/")
async def index():
    return RedirectResponse("/docs")