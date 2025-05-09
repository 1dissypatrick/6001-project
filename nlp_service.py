from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Load zero-shot classification model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Define possible subjects
candidate_labels = [
    "Chinese Language Education",
    "English Language Education",
    "Mathematics Education",
    "Science Education",
    "Social and Humanistic Education",
    "Physical Education",
    "Arts and Humanities",
    "History",
    "Business and Communication",
    "Career and Technical Education",
    "General Studies",
]

class QueryRequest(BaseModel):
    query: str

@app.post("/classify")
async def classify_query(request: QueryRequest):
    result = classifier(request.query, candidate_labels, multi_label=False)
    subject = result["labels"][0]
    # Return null if the top label has low confidence and query is likely irrelevant
    if result["scores"][0] < 0.5 and not any(keyword in request.query.lower() for keyword in sum(subjectKeywords.values(), [])):
        return {"subject": None}
    return {"subject": subject}