from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from curriculum_processor import CurriculumProcessor
from safety_layer import SafetyLayer
import os
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com/v1",
)

processor = CurriculumProcessor()
safety = SafetyLayer()

class QueryRequest(BaseModel):
    question: str
    grade_level: str
    subject: str

@app.post("/ask")
async def ask_question(request: QueryRequest):
    if not safety.validate_query(request.question, request.subject):
        raise HTTPException(status_code=400, detail="Query outside curriculum scope")
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": f"You are a {request.grade_level} teacher in Kenya. Respond using KICD guidelines for {request.subject}."},
            {"role": "user", "content": request.question}
        ],
        temperature=0.3 if request.grade_level == "primary" else 0.5,
        max_tokens=500
    )
    
    return {"response": response.choices[0].message.content}