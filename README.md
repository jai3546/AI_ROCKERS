# AI Mentor Matchmaking System

This system matches students with mentors based on various criteria including subject needs, availability, region, language, and emotional state.

## Features

- Matches students with mentors based on weighted criteria
- Provides the best match and top alternatives
- RESTful API for easy integration

## Matching Criteria

The system uses the following weighted scoring system:
- +3 points for subject match
- +2 points for time availability match
- +1 point for region match
- +1 point for language match
- +1 point if the student is stressed (prioritizing students who need more support)

## Project Structure

```
.
├── data/
│   ├── students.json    # Student data
│   └── mentors.json     # Mentor data
├── mentor_matcher.py    # Core matching logic
├── main.py              # FastAPI application
├── requirements.txt     # Dependencies
└── README.md            # Documentation
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the API

Start the FastAPI server:

```
python main.py
```

The API will be available at http://localhost:8000

## API Endpoints

### GET /

Returns basic API information.

### GET /match-mentor/{student_id}

Matches a student with mentors based on the scoring criteria.

**Parameters:**
- `student_id`: ID of the student to match

**Response:**
```json
{
  "student": {
    "id": "S001",
    "emotional_state": "happy",
    "subject_need": "math",
    "available_time": "morning",
    "region": "telangana",
    "language": "telugu"
  },
  "best_match": {
    "id": "M001",
    "expertise": ["math", "science"],
    "available_time": ["morning", "afternoon"],
    "region": ["telangana", "andhra_pradesh"],
    "language": ["telugu", "english"]
  },
  "alternatives": [
    {
      "id": "M004",
      "expertise": ["math", "science", "history"],
      "available_time": ["morning", "evening", "night"],
      "region": ["telangana", "andhra_pradesh", "karnataka"],
      "language": ["telugu", "kannada", "english", "hindi"]
    },
    {
      "id": "M007",
      "expertise": ["math", "history"],
      "available_time": ["morning", "night"],
      "region": ["telangana", "andhra_pradesh", "tamil_nadu"],
      "language": ["telugu", "tamil", "english"]
    }
  ]
}
```

## Data Format

### Student Data

Each student has the following attributes:
- `id`: Unique identifier
- `emotional_state`: Current emotional state (happy, neutral, stressed)
- `subject_need`: Subject they need help with (math, science, history, english)
- `available_time`: When they're available (morning, afternoon, evening, night)
- `region`: Geographic region
- `language`: Preferred language

### Mentor Data

Each mentor has the following attributes:
- `id`: Unique identifier
- `expertise`: List of subjects they can teach
- `available_time`: List of times they're available
- `region`: List of regions they can serve
- `language`: List of languages they can speak

## Testing

You can test the API using curl:

```bash
curl http://localhost:8000/match-mentor/S001
```

Or using the interactive Swagger documentation at http://localhost:8000/docs
