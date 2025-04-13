"""
AI Mentor Matchmaking System API

This FastAPI application provides endpoints for matching students with mentors
based on various criteria including subject needs, availability, region, language,
and emotional state.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import uvicorn

from mentor_matcher import find_best_matches

# Initialize FastAPI app
app = FastAPI(
    title="AI Mentor Matchmaking System",
    description="API for matching students with mentors based on various criteria",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint that returns API information"""
    return {
        "message": "AI Mentor Matchmaking System API",
        "version": "1.0.0",
        "endpoints": {
            "/match-mentor/{student_id}": "Get mentor matches for a student"
        }
    }


@app.get("/match-mentor/{student_id}")
async def match_mentor(student_id: str) -> Dict[str, Any]:
    """
    Match a student with the best mentor based on various criteria.
    
    Args:
        student_id: The ID of the student to match
        
    Returns:
        Dict: A dictionary containing the student, best match, and alternatives
        
    Raises:
        HTTPException: If student is not found or other errors occur
    """
    try:
        result = find_best_matches(student_id)
        return {
            "student": result["student"],
            "best_match": result["best_match"],
            "alternatives": result["alternatives"]
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


if __name__ == "__main__":
    # Run the FastAPI app with uvicorn when script is executed directly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
