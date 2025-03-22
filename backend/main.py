from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from curriculum_processor import CurriculumProcessor
from safety_layer import SafetyLayer
import os
import re
from openai import OpenAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key="",
    base_url="https://models.inference.ai.azure.com",
)

processor = CurriculumProcessor()

ACCESS_TOKEN = ""
safety = SafetyLayer(ACCESS_TOKEN)

PDF_PATHS = [
    "curriculum/mathematics_secondary1.pdf",
    "curriculum/biology_secondary.pdf",
    "curriculum/mathematics_secondary2.pdf",
    "curriculum/physics_secondary.pdf",
    "curriculum/mathematics_secondary3.pdf",
    "curriculum/mathematics_secondary4.pdf",
    "curriculum/chemistry_secondary.pdf",
    "curriculum/kiswahili_secondaryFasihi.pdf",
    "curriculum/kiswahili_secondaryInsha.pdf",
    "curriculum/kiswahili_secondaryLuhga.pdf",
]
processor.process_multiple_pdfs(PDF_PATHS)

def clean_response(text: str) -> str:
    # Remove markdown headers (e.g., ###)
    text = re.sub(r'#+\s*', '', text)
    
    # Remove bold formatting (**text** or __text__)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'__(.*?)__', r'\1', text)
    
    # Remove LaTeX-style equation brackets (\[ and \])
    text = re.sub(r'\\\[(.*?)\\\]', r'\1', text)
    
    return text.strip()

class QueryRequest(BaseModel):
    question: str
    grade_level: str
    subject: str

@app.post("/ask")
async def ask_question(request: QueryRequest):
    if not safety.validate_query(request.question, request.subject):
        print("Query validation failed")
        raise HTTPException(status_code=400, detail="Query outside curriculum scope")
    try:
        # Get relevant curriculum context
        context_chunks = processor.get_subject_context(
            query=request.question,
            subject=request.subject.lower(),
            k=3  # Get top 3 relevant chunks
        )
        context = "\n".join(context_chunks)

        # Build system prompt with curriculum context
        system_prompt = f"""You are a {request.grade_level}-level educational assistant for Kenya. 
Respond using KICD-approved materials for {request.subject}. 
Curriculum Context: {context}"""

        # Get AI response
        response = client.chat.completions.create(
            model="DeepSeek-V3",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            temperature=0.3 if request.grade_level == "primary" else 0.5,
            max_tokens=500
        )
        
        cleaned_text = clean_response(response.choices[0].message.content)
        return {"response": cleaned_text}

    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
    
class FlashCardRequest(BaseModel):
    subject: str
    grade_level: str

@app.post("/generate-flashcards")
async def generate_flashcards(request: FlashCardRequest):
    try:
        # Get curriculum context
        context_chunks = processor.get_subject_context(
            query=f"Generate practice questions about {request.subject}",
            subject=request.subject.lower(),
            k=5  # Get more context for question generation
        )
        context = "\n".join(context_chunks)

        # Generate flash cards using AI
        prompt = f"""Generate 10 short question-answer pairs for {request.grade_level} level {request.subject} students.
Context from KICD materials: {context}
Format: Q: [question]\\nA: [answer]\\n\\n"""

        response = client.chat.completions.create(
            model="DeepSeek-V3",
            messages=[
                {"role": "system", "content": "You are a curriculum-aligned question generator"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse the response into Q&A pairs
        qa_pairs = []
        current_q = None
        for line in response.choices[0].message.content.split('\n'):
            if line.startswith('Q:'):
                current_q = line[3:].strip()
            elif line.startswith('A:') and current_q:
                qa_pairs.append({
                    "question": current_q,
                    "answer": line[3:].strip()
                })
                current_q = None
        
        return {"flashcards": qa_pairs[:10]}  # Return max 10 pairs

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error flashcards: {str(e)}")
