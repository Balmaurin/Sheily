from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AI System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "AI System"}

@app.get("/query")
async def query():
    return {"status": "ready", "message": "AI System ready for queries"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
