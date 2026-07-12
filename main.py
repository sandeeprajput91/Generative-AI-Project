import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
# Ensure these modules exist in your 'modules' folder
from modules import qna, explainer, summary, roadmap, test_quiz, flashcards, timetable

app = FastAPI(title="EduGenie API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryPayload(BaseModel):
    query: str
    level: Optional[str] = "Beginner"

@app.post("/{mode}")
async def handle_request(mode: str, payload: QueryPayload):
    modules_map = {
        "qa": qna.answer_question,
        "explainer": explainer.explain_topic,
        "summary": summary.summarize_text,
        "roadmap": roadmap.generate_roadmap,
        "test_quiz": test_quiz.generate_test_quiz,
        "flashcards": flashcards.generate_flashcards,
        "timetable": timetable.build_timetable
    }
    
    target_function = modules_map.get(mode)
    
    if not target_function:
        raise HTTPException(status_code=400, detail=f"Error: The module '{mode}' is not configured in the backend.")
        
    try:
        if mode == "roadmap":
            result = target_function(payload.query, payload.level)
        else:
            result = target_function(payload.query)
        return {"answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing {mode}: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
