from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import torch
import uvicorn

app = FastAPI()

# Load your fine-tuned Mistral model
minerva_pipe = pipeline(
    "text-generation",
    model="./Minerva-7B-4bit",
    device="cuda" if torch.cuda.is_available() else "cpu",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

class ChatRequest(BaseModel):
    prompt: str
    history: list = []

@app.post("/minerva")
async def chat_with_minerva(request: ChatRequest):
    try:
        # Format the prompt with history if needed
        full_prompt = format_prompt(request.prompt, request.history)
        
        # Generate response
        result = minerva_pipe(
            full_prompt,
            max_new_tokens=200,
            temperature=0.7,
            do_sample=True
        )
        
        return {"response": result[0]['generated_text'].replace(full_prompt, "").strip()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": "Minerva-7B-4bit",
        "device": minerva_pipe.device,
        "ready": True
    }

def format_prompt(prompt, history):
    # Implement your prompt formatting logic here
    return prompt

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
