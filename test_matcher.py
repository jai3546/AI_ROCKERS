"""
Test script for the AI Mentor Matchmaking System.

This script tests the mentor matching functionality by running a few test cases
and printing the results.
"""

import json
from mentor_matcher import score_match, find_best_matches


def test_score_match():
    """Test the score_match function with various scenarios"""
    print("Testing score_match function...")
    
    # Test case 1: Perfect match with stressed student
    student1 = {
        "id": "S001",
        "emotional_state": "stressed",
        "subject_need": "math",
        "available_time": "morning",
        "region": "telangana",
        "language": "telugu"
    }
    
    mentor1 = {
        "id": "M001",
        "expertise": ["math", "science"],
        "available_time": ["morning", "afternoon"],
        "region": ["telangana", "andhra_pradesh"],
        "language": ["telugu", "english"]
    }
    
    score1 = score_match(student1, mentor1)
    print(f"Perfect match with stressed student: {score1}/8 points")
    assert score1 == 8, f"Expected 8 points, got {score1}"
    
    # Test case 2: No matches
    student2 = {
        "id": "S002",
        "emotional_state": "happy",
        "subject_need": "history",
        "available_time": "night",
        "region": "kerala",
        "language": "malayalam"
    }
    
    mentor2 = {
        "id": "M002",
        "expertise": ["math", "science"],
        "available_time": ["morning", "afternoon"],
        "region": ["telangana", "andhra_pradesh"],
        "language": ["telugu", "english"]
    }
    
    score2 = score_match(student2, mentor2)
    print(f"No matches: {score2}/8 points")
    assert score2 == 0, f"Expected 0 points, got {score2}"
    
    # Test case 3: Partial matches
    student3 = {
        "id": "S003",
        "emotional_state": "neutral",
        "subject_need": "math",
        "available_time": "evening",
        "region": "telangana",
        "language": "english"
    }
    
    mentor3 = {
        "id": "M003",
        "expertise": ["math", "science"],
        "available_time": ["morning", "afternoon"],
        "region": ["telangana", "andhra_pradesh"],
        "language": ["telugu", "english"]
    }
    
    score3 = score_match(student3, mentor3)
    print(f"Partial matches: {score3}/8 points")
    assert score3 == 5, f"Expected 5 points, got {score3}"
    
    print("All score_match tests passed!\n")


def test_find_best_matches():
    """Test the find_best_matches function with real data"""
    print("Testing find_best_matches function...")
    
    # Test with existing student IDs
    test_ids = ["S001", "S002", "S006"]
    
    for student_id in test_ids:
        try:
            result = find_best_matches(student_id)
            print(f"\nStudent {student_id} ({result['student']['subject_need']}, {result['student']['emotional_state']}):")
            print(f"Best match: {result['best_match']['id']} - Expertise: {result['best_match']['expertise']}")
            print(f"Alternatives: {[alt['id'] for alt in result['alternatives']]}")
        except Exception as e:
            print(f"Error with student {student_id}: {e}")
    
    # Test with non-existent student ID
    try:
        find_best_matches("NONEXISTENT")
        print("Test failed: Should have raised an exception for non-existent student ID")
    except ValueError:
        print("\nCorrectly raised ValueError for non-existent student ID")
    
    print("All find_best_matches tests completed!")


if __name__ == "__main__":
    test_score_match()
    test_find_best_matches()
