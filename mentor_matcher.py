"""
Mentor Matching Module

This module provides functionality to match students with mentors based on
various criteria including subject needs, availability, region, language,
and emotional state.
"""

import json
from typing import Dict, List, Any


def load_data() -> tuple:
    """
    Load student and mentor data from JSON files.
    
    Returns:
        tuple: A tuple containing (students, mentors) as dictionaries
    """
    try:
        with open("data/students.json", "r") as f:
            students = json.load(f)
        
        with open("data/mentors.json", "r") as f:
            mentors = json.load(f)
            
        return students, mentors
    except FileNotFoundError as e:
        raise FileNotFoundError(f"Data file not found: {e}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format in data file: {e}")


def score_match(student: Dict[str, Any], mentor: Dict[str, Any]) -> int:
    """
    Calculate a matching score between a student and a mentor.
    
    Scoring criteria:
    - +3 for subject match
    - +2 for time match
    - +1 for region match
    - +1 for language match
    - +1 if student is stressed
    
    Args:
        student: Dictionary containing student information
        mentor: Dictionary containing mentor information
        
    Returns:
        int: The calculated matching score
    """
    score = 0
    
    # Subject match (+3)
    if student["subject_need"] in mentor["expertise"]:
        score += 3
    
    # Time match (+2)
    if student["available_time"] in mentor["available_time"]:
        score += 2
    
    # Region match (+1)
    if student["region"] in mentor["region"]:
        score += 1
    
    # Language match (+1)
    if student["language"] in mentor["language"]:
        score += 1
    
    # Emotional state bonus (+1 if stressed)
    if student["emotional_state"] == "stressed":
        score += 1
    
    return score


def find_best_matches(student_id: str) -> Dict[str, Any]:
    """
    Find the best mentor matches for a given student.
    
    Args:
        student_id: The ID of the student to match
        
    Returns:
        Dict: A dictionary containing the best match and alternatives
    """
    students, mentors = load_data()
    
    # Find the student by ID
    student = next((s for s in students if s["id"] == student_id), None)
    if not student:
        raise ValueError(f"Student with ID {student_id} not found")
    
    # Score all mentors
    scored_mentors = []
    for mentor in mentors:
        score = score_match(student, mentor)
        scored_mentors.append({
            "mentor": mentor,
            "score": score
        })
    
    # Sort mentors by score (descending)
    scored_mentors.sort(key=lambda x: x["score"], reverse=True)
    
    # Get the best match and top 2 alternatives
    best_match = scored_mentors[0]["mentor"] if scored_mentors else None
    alternatives = [m["mentor"] for m in scored_mentors[1:3]] if len(scored_mentors) > 1 else []
    
    return {
        "student": student,
        "best_match": best_match,
        "alternatives": alternatives
    }


if __name__ == "__main__":
    # Simple test
    try:
        result = find_best_matches("S001")
        print(f"Best match for student S001: {result['best_match']['id']}")
        print(f"Alternative matches: {[alt['id'] for alt in result['alternatives']]}")
    except Exception as e:
        print(f"Error: {e}")
