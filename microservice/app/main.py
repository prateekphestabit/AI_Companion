from fastapi import FastAPI

app = FastAPI()

@app.get("/chat")
def chat(message: str):
    return {"result": f"Hello, how are you? You said: {message}"}